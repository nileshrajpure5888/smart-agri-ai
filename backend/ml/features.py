import pandas as pd

def create_features(df: pd.DataFrame):
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])

    # ✅ time based features
    df["day"] = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["weekday"] = df["date"].dt.weekday
    df["weekofyear"] = df["date"].dt.isocalendar().week.astype(int)

    # ✅ rolling features (past data)
    df["price_lag1"] = df["modal_price"].shift(1)
    df["price_lag7"] = df["modal_price"].shift(7)
    df["arrivals_lag1"] = df["arrivals"].shift(1)

    df["price_roll7"] = df["modal_price"].rolling(7).mean()
    df["arrivals_roll7"] = df["arrivals"].rolling(7).mean()

    df = df.dropna().reset_index(drop=True)
    return df
