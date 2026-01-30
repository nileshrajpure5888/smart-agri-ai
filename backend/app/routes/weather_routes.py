from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import db
from app.services.weather_service import get_weather_hourly_daily
from app.services.weather_rules import analyze_weather_risk
from app.services.crop_risk_rules import crop_specific_advisory

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/advisory/{user_id}")
def weather_advisory(user_id: str):
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    loc = user.get("location")
    if not loc:
        raise HTTPException(status_code=400, detail="Location not set")

    weather = get_weather_hourly_daily(loc["lat"], loc["lon"])
    alerts = analyze_weather_risk(weather)

    # ✅ latest crop calendar
    cal = db["crop_calendars"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    crop_name = cal.get("crop_name") if cal else ""

    humidity = weather.get("current", {}).get("humidity", 0)
    temp = weather.get("current", {}).get("temp", 0)
    pop = weather.get("hourly", [{}])[0].get("pop", 0)

    crop_msg = crop_specific_advisory(crop_name, humidity, temp, pop)

    # hourly 24h
    hourly_24 = []
    for h in weather.get("hourly", [])[:24]:
        hourly_24.append({
            "dt": h.get("dt"),
            "temp": h.get("temp"),
            "humidity": h.get("humidity"),
            "pop": h.get("pop", 0)
        })

    # daily 7d
    daily_7 = []
    for d in weather.get("daily", [])[:7]:
        daily_7.append({
            "dt": d.get("dt"),
            "min": d.get("temp", {}).get("min"),
            "max": d.get("temp", {}).get("max"),
            "humidity": d.get("humidity"),
            "pop": d.get("pop", 0)
        })

    return {
        "location": loc,
        "current": weather.get("current", {}),
        "alerts": alerts,
        "crop_name": crop_name,
        "crop_advisory": crop_msg,
        "hourly_24h": hourly_24,
        "daily_7d": daily_7
    }
