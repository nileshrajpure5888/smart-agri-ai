def analyze_weather_risk(weather_json):
    alerts = {
        "rain_alert": False,
        "humidity_alert": False,
        "heat_alert": False,
        "message": ""
    }

    hourly = weather_json.get("hourly", [])[:8]

    rain = sum(1 for h in hourly if h.get("pop", 0) >= 0.6)
    humid = sum(1 for h in hourly if h.get("humidity", 0) >= 85)
    heat = sum(1 for h in hourly if h.get("temp", 0) >= 35)

    if rain >= 2: alerts["rain_alert"] = True
    if humid >= 4: alerts["humidity_alert"] = True
    if heat >= 4: alerts["heat_alert"] = True

    msgs = []
    if alerts["rain_alert"]:
        msgs.append("🌧️ Rain expected. Avoid irrigation today.")
    if alerts["humidity_alert"]:
        msgs.append("💧 High humidity. Fungal disease risk.")
    if alerts["heat_alert"]:
        msgs.append("🔥 Heatwave. Increase irrigation frequency.")

    alerts["message"] = "\n".join(msgs) if msgs else "✅ Weather normal. No risks detected."
    return alerts
