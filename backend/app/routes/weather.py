import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

# ✅ load env file
load_dotenv()

router = APIRouter(prefix="/api/weather", tags=["Weather"])

API_KEY = os.getenv("OPENWEATHER_API_KEY")

@router.get("/by-coordinates")
def weather_by_coordinates(lat: float, lon: float):

    # ✅ debug print
    print("✅ API KEY FROM ENV =", API_KEY)

    if not API_KEY:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY missing in backend/.env")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY.strip(),   # ✅ remove spaces
        "units": "metric"
    }

    res = requests.get(url, params=params)
    data = res.json()

    print("✅ OpenWeather status:", res.status_code)
    print("✅ OpenWeather data:", data)

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=data)

    return {
        "location": data.get("name", "Unknown"),
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "weather": data["weather"][0]["description"],
        "wind_speed": data["wind"]["speed"],
    }
