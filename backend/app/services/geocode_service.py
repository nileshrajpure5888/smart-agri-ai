import os, requests
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def geocode_city(city: str):
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {"q": city, "limit": 1, "appid": OPENWEATHER_API_KEY}
    res = requests.get(url, params=params, timeout=10)
    res.raise_for_status()
    data = res.json()
    if not data:
        return None

    d = data[0]
    return {
        "city": d.get("name"),
        "state": d.get("state"),
        "country": d.get("country"),
        "lat": d.get("lat"),
        "lon": d.get("lon")
    }
