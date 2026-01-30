import os, requests
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather_hourly_daily(lat: float, lon: float):
    url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "exclude": "minutely,alerts"
    }
    res = requests.get(url, params=params, timeout=10)
    res.raise_for_status()
    return res.json()
