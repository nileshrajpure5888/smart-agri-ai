from fastapi import APIRouter
import pandas as pd
import requests
import os
import time
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/market",
    tags=["Market Sync"]
)


# ======================================================
# CONFIG
# ======================================================

API_KEY = os.getenv("DATA_GOV_API_KEY")

AGMARKET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

DATA_DIR = os.path.join(BASE_DIR, "ml", "data")

CSV_PATH = os.path.join(DATA_DIR, "mandi_data.csv")

CACHE_FILE = os.path.join(DATA_DIR, "last_sync.json")

SYNC_INTERVAL_HOURS = 6   # sync every 6 hours only


print("📁 Market CSV:", CSV_PATH)
print("📁 Sync Cache:", CACHE_FILE)


# ======================================================
# CACHE HANDLING
# ======================================================

def get_last_sync():

    if not os.path.exists(CACHE_FILE):
        return None

    try:
        with open(CACHE_FILE, "r") as f:
            data = json.load(f)

        return datetime.fromisoformat(data["last_sync"])

    except:
        return None


def update_last_sync():

    with open(CACHE_FILE, "w") as f:
        json.dump(
            {"last_sync": datetime.now().isoformat()},
            f
        )


# ======================================================
# FETCH GOVT DATA
# ======================================================

def fetch_govt_data(crop: str, mandi: str):

    if not API_KEY:
        raise Exception("DATA_GOV_API_KEY missing")

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 30,
        "filters[commodity]": crop,
        "filters[market]": mandi,
    }

    print("🌐 Fetching from Agmarknet...")

    res = requests.get(
        AGMARKET_URL,
        params=params,
        timeout=20
    )

    if res.status_code != 200:
        raise Exception(f"HTTP {res.status_code}")

    data = res.json()

    return data.get("records", [])


# ======================================================
# SAVE CSV
# ======================================================

def save_to_csv(records):

    if not records:
        return 0

    rows = []

    for r in records:

        rows.append({
            "date": r.get("arrival_date"),
            "crop": r.get("commodity"),
            "mandi": r.get("market"),
            "modal_price": float(r.get("modal_price", 0)),
            "arrivals": float(r.get("arrivals", 0)),
            "temp": 0,
            "rain": 0,
            "humidity": 0,
            "festival": 0,
        })

    df_new = pd.DataFrame(rows)

    if os.path.exists(CSV_PATH):

        df_old = pd.read_csv(CSV_PATH)

        df_all = pd.concat([df_old, df_new])

        df_all = df_all.drop_duplicates(
            ["date", "crop", "mandi"]
        )

    else:
        df_all = df_new

    df_all.to_csv(CSV_PATH, index=False)

    return len(df_new)


# ======================================================
# SYNC ENDPOINT (FAST)
# ======================================================

@router.get("/sync-live")
def sync_live_data(crop: str, mandi: str):

    try:

        # Check cache
        last_sync = get_last_sync()

        if last_sync:

            age = datetime.now() - last_sync

            if age < timedelta(hours=SYNC_INTERVAL_HOURS):

                return {
                    "status": "cached",
                    "message": "Using cached mandi data",
                    "last_sync": last_sync.isoformat()
                }

        # Fetch fresh
        records = fetch_govt_data(crop, mandi)

        if not records:

            return {
                "status": "empty",
                "message": "No new data from govt API"
            }

        saved = save_to_csv(records)

        update_last_sync()

        return {
            "status": "success",
            "rows_saved": saved,
            "message": "Live mandi data synced",
            "time": datetime.now().isoformat()
        }

    except Exception as e:

        print("❌ Sync Error:", e)

        return {
            "status": "error",
            "message": str(e)
        }
