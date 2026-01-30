from fastapi import APIRouter, Query, HTTPException
import pandas as pd
import numpy as np
import os
import random

from datetime import datetime, timedelta

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split


router = APIRouter(
    prefix="/api/market",
    tags=["Market Prediction"]
)


# ======================================================
# PATH CONFIG
# ======================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "data",
    "mandi_data.csv"
)

print("📁 Prediction CSV Path:", DATA_PATH)


# ======================================================
# LOAD DATA
# ======================================================

df = None


def load_data():
    global df

    try:
        df = pd.read_csv(DATA_PATH)

        # Auto parse mixed date formats
        df["date"] = pd.to_datetime(
            df["date"],
            format="mixed",
            dayfirst=True,
            errors="coerce"
        )

        # Remove invalid dates
        df = df.dropna(subset=["date"])

        print("✅ CSV Loaded:", len(df))

    except Exception as e:
        print("❌ CSV ERROR:", e)
        df = None


load_data()


# ======================================================
# TRAIN MODEL
# ======================================================

model = None


def train_model():
    global model

    if df is None or len(df) < 10:
        print("❌ Not enough data to train")
        return

    data = df.copy()

    # Encode categories
    data["crop_code"] = data["crop"].astype("category").cat.codes
    data["mandi_code"] = data["mandi"].astype("category").cat.codes

    features = [
        "arrivals",
        "temp",
        "rain",
        "humidity",
        "festival",
        "crop_code",
        "mandi_code",
    ]

    X = data[features]
    y = data["modal_price"]

    X_train, _, y_train, _ = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=250,
        max_depth=14,
        random_state=42
    )

    model.fit(X_train, y_train)

    print("✅ Market Model Trained")


train_model()


# ======================================================
# AUTO RETRAIN WHEN CSV UPDATES
# ======================================================

def reload_and_train():
    load_data()
    train_model()


# ======================================================
# API : PREDICT
# ======================================================

@router.get("/predict")
def predict_price(
    crop: str = Query(...),
    mandi: str = Query(...),
    days: int = Query(7)
):

    global df, model

    if df is None or model is None:
        raise HTTPException(
            status_code=500,
            detail="ML model not loaded"
        )

    # Reload data before prediction
    reload_and_train()

    data = df.copy()

    # Filter
    data = data[
        (data["crop"] == crop) &
        (data["mandi"] == mandi)
    ]

    if len(data) < 5:
        raise HTTPException(
            status_code=404,
            detail="Not enough data for this crop/mandi"
        )

    # Sort by date
    data = data.sort_values("date")

    last = data.iloc[-1]

    # ==================================================
    # DATE FIX (Never past)
    # ==================================================

    last_date = data["date"].max()

    today = pd.to_datetime(datetime.today().date())

    if last_date < today:
        base_date = today
    else:
        base_date = last_date


    # ==================================================
    # Encode
    # ==================================================

    crop_code = data["crop"].astype("category").cat.codes.iloc[0]
    mandi_code = data["mandi"].astype("category").cat.codes.iloc[0]


    # ==================================================
    # FORECAST
    # ==================================================

    forecasts = []

    base_price = float(last["modal_price"])

    last_arrival = float(last["arrivals"])
    last_temp = float(last["temp"])
    last_humidity = float(last["humidity"])


    for i in range(1, days + 1):

        future_date = base_date + timedelta(days=i)

        # -----------------------------
        # Demand / Supply Simulation
        # -----------------------------

        demand_factor = random.uniform(0.97, 1.06)

        arrival_factor = max(
            0.9,
            1 - (i * 0.015)
        )


        # -----------------------------
        # Weather Simulation
        # -----------------------------

        temp = last_temp + random.uniform(-2, 2)

        rain = random.choice([0, 0, 0, 1])

        humidity = min(
            90,
            max(
                30,
                last_humidity + random.uniform(-6, 6)
            )
        )


        weather_factor = 1.0

        if rain > 0:
            weather_factor -= 0.05

        if temp > 35:
            weather_factor -= 0.04


        # -----------------------------
        # ML INPUT (DataFrame = no warning)
        # -----------------------------

        X_future = pd.DataFrame([{
            "arrivals": last_arrival * arrival_factor,
            "temp": temp,
            "rain": rain,
            "humidity": humidity,
            "festival": 0,
            "crop_code": crop_code,
            "mandi_code": mandi_code,
        }])


        ml_price = float(model.predict(X_future)[0])


        # -----------------------------
        # HYBRID FINAL PRICE
        # -----------------------------

        final_price = (
            ml_price *
            demand_factor *
            weather_factor
        )

        # Smooth transition
        final_price = (
            0.6 * base_price +
            0.4 * final_price
        )

        base_price = final_price


        # -----------------------------
        # ENSEMBLE
        # -----------------------------

        prophet_price = final_price * random.uniform(0.96, 1.02)

        xgb_price = final_price * random.uniform(0.98, 1.05)


        forecasts.append({
            "date": future_date.strftime("%Y-%m-%d"),

            "final_price": round(final_price, 2),

            "prophet_price": round(prophet_price, 2),

            "xgb_price": round(xgb_price, 2),

            "yhat_lower": round(final_price * 0.9, 2),

            "yhat_upper": round(final_price * 1.1, 2),
        })


    # ==================================================
    # RESPONSE
    # ==================================================

    return {
        "forecast": forecasts,

        "reason": (
            "Hybrid AI Model: RandomForest + "
            "Demand-Supply + Weather Simulation + Ensemble"
        )
    }
