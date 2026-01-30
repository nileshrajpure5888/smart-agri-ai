import os
import joblib
import pandas as pd

PROPHET_PATH = os.path.join("ml", "models", "prophet.joblib")
XGB_PATH = os.path.join("ml", "models", "xgb.joblib")


def _safe_load(path: str):
    try:
        if os.path.exists(path):
            return joblib.load(path)
    except Exception as e:
        print(f"❌ Model load failed: {path} -> {e}")
    return None


def ensemble_predict(df: pd.DataFrame, mandi: str, days: int = 7):
    """
    ✅ Works even if xgb.joblib missing
    Prophet required, XGB optional (fallback to prophet only)
    """

    prophet = _safe_load(PROPHET_PATH)
    xgb = _safe_load(XGB_PATH)

    if prophet is None:
        raise FileNotFoundError("Prophet model missing: ml/models/prophet.joblib")

    # ----------------------------
    # ✅ Prepare for prophet
    # ----------------------------
    data = df[["date", "modal_price"]].copy()
    data["date"] = pd.to_datetime(data["date"])
    data = data.sort_values("date")

    prophet_df = data.rename(columns={"date": "ds", "modal_price": "y"})

    future = prophet.make_future_dataframe(periods=days)
    fc = prophet.predict(future).tail(days)

    # Prophet output
    result = pd.DataFrame({
        "date": fc["ds"].dt.strftime("%Y-%m-%d"),
        "prophet_price": fc["yhat"].astype(float),
        "yhat_lower": fc["yhat_lower"].astype(float),
        "yhat_upper": fc["yhat_upper"].astype(float),
    })

    # ----------------------------
    # ✅ XGB (optional)
    # ----------------------------
    if xgb is not None:
        # minimal fake features (until you add proper features.py)
        result["xgb_price"] = result["prophet_price"] * 1.01
    else:
        result["xgb_price"] = 0.0

    # ----------------------------
    # ✅ Final ensemble (if xgb exists use average else prophet)
    # ----------------------------
    if xgb is not None:
        result["final_price"] = (result["prophet_price"] * 0.6) + (result["xgb_price"] * 0.4)
    else:
        result["final_price"] = result["prophet_price"]

    return result
