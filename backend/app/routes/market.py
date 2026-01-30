from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(prefix="/api/market", tags=["Market"])

# ✅ Fake realtime dataset (for demo)
# Later you can replace with DB + Govt API
MARKET_DATA = {
    "Pune": {
        "Onion": [
            {"date": "2026-01-10", "price": 1800},
            {"date": "2026-01-11", "price": 1900},
            {"date": "2026-01-12", "price": 2100},
            {"date": "2026-01-13", "price": 2050},
            {"date": "2026-01-14", "price": 2200},
            {"date": "2026-01-15", "price": 2150},
        ],
        "Tomato": [
            {"date": "2026-01-10", "price": 900},
            {"date": "2026-01-11", "price": 920},
            {"date": "2026-01-12", "price": 880},
            {"date": "2026-01-13", "price": 950},
            {"date": "2026-01-14", "price": 1000},
            {"date": "2026-01-15", "price": 980},
        ],
    },
    "Nashik": {
        "Onion": [
            {"date": "2026-01-10", "price": 2000},
            {"date": "2026-01-11", "price": 2050},
            {"date": "2026-01-12", "price": 2150},
            {"date": "2026-01-13", "price": 2250},
            {"date": "2026-01-14", "price": 2400},
            {"date": "2026-01-15", "price": 2500},
        ]
    },
    "Solapur": {
        "Onion": [
            {"date": "2026-01-10", "price": 1500},
            {"date": "2026-01-11", "price": 1600},
            {"date": "2026-01-12", "price": 1700},
            {"date": "2026-01-13", "price": 1650},
            {"date": "2026-01-14", "price": 1750},
            {"date": "2026-01-15", "price": 1800},
        ]
    },
}


@router.get("/trend")
def get_market_trend(crop: str = "Onion", mandi: str = "Pune"):
    """
    ✅ Returns price trend graph data
    """
    trend = MARKET_DATA.get(mandi, {}).get(crop, [])
    return {"crop": crop, "mandi": mandi, "trend": trend}


class SellRequest(BaseModel):
    crop: str
    mandi: str
    trend: List[dict] = []


@router.post("/best-sell-time")
def best_sell_time(data: SellRequest):
    """
    ✅ Uses REAL trend data (graph) for AI suggestion
    so response will not be same always.
    """

    if not data.trend or len(data.trend) < 3:
        # fallback logic if not enough data
        return {
            "ai_result": json.dumps(
                {
                    "recommendation": "Insufficient market data. Check tomorrow’s prices.",
                    "best_day": "Tomorrow",
                    "reason": "Not enough trend data to compute a confident suggestion.",
                    "confidence": 55,
                }
            )
        }

    # ✅ Calculate min/max/last trend in python first
    prices = [int(x.get("price", 0)) for x in data.trend if x.get("price")]

    min_price = min(prices)
    max_price = max(prices)
    last_price = prices[-1]
    first_price = prices[0]

    direction = "upward" if last_price > first_price else "downward" if last_price < first_price else "stable"

    prompt = f"""
You are a smart agriculture market assistant for Indian farmers.
Crop: {data.crop}
Mandi: {data.mandi}

Market trend data:
{json.dumps(data.trend)}

Summary:
- min_price: {min_price}
- max_price: {max_price}
- last_price: {last_price}
- trend_direction: {direction}

Task:
Give "Best sell day/time recommendation" based on this trend.
Return ONLY JSON with keys:
recommendation, best_day, reason, confidence (0-100)
No extra text.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )

        content = response.choices[0].message.content.strip()

        # Ensure JSON
        if not content.startswith("{"):
            raise ValueError("AI output not JSON")

        return {"ai_result": content}

    except Exception as e:
        # ✅ Fallback if AI fails
        if direction == "upward":
            rec = "Price trend is rising. Sell after 1–2 days for better profit."
            best_day = "After 1-2 days"
            conf = 75
        elif direction == "downward":
            rec = "Price trend is falling. Sell today or tomorrow to avoid loss."
            best_day = "Today / Tomorrow"
            conf = 78
        else:
            rec = "Price is stable. Sell anytime in next 2 days."
            best_day = "Next 2 days"
            conf = 65

        return {
            "ai_result": json.dumps(
                {
                    "recommendation": rec,
                    "best_day": best_day,
                    "reason": f"AI error fallback used. Trend direction is {direction}. Error: {str(e)}",
                    "confidence": conf,
                }
            )
        }
