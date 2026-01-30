import pandas as pd
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from ml.features import create_features

FEATURE_COLS = [
    "arrivals", "temp", "rain", "humidity", "festival",
    "day", "month", "weekday", "weekofyear",
    "price_lag1", "price_lag7", "arrivals_lag1",
    "price_roll7", "arrivals_roll7"
]

def train_xgb(csv_path="ml/data/mandi_data.csv", out="ml/models/xgb.joblib"):
    df = pd.read_csv(csv_path)
    df = create_features(df)

    X = df[FEATURE_COLS]
    y = df["modal_price"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model = XGBRegressor(
        n_estimators=600,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.9
    )

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    print("✅ XGB MAE:", mae)

    joblib.dump(model, out)
    print("✅ XGB model saved:", out)

if __name__ == "__main__":
    train_xgb()
