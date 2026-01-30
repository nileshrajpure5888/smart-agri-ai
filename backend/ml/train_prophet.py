import pandas as pd
import joblib
from prophet import Prophet

def train_prophet(df: pd.DataFrame, out="ml/models/prophet.joblib"):
    prophet_df = df[["date", "modal_price"]].rename(columns={"date":"ds","modal_price":"y"})
    model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
    model.fit(prophet_df)
    joblib.dump(model, out)
    print("✅ Prophet model saved:", out)

if __name__ == "__main__":
    df = pd.read_csv("ml/data/mandi_data.csv")
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    train_prophet(df)
