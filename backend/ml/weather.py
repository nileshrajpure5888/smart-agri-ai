import requests

OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_KEY"

def get_weather(city="Pune"):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    r = requests.get(url, timeout=15)
    data = r.json()

    return {
        "temp": float(data["main"]["temp"]),
        "humidity": float(data["main"]["humidity"]),
        "rain": float(data.get("rain", {}).get("1h", 0.0)),
    }
