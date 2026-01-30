def crop_specific_advisory(crop_name: str, humidity: int, temp: float, pop: float):
    crop = (crop_name or "").lower()
    adv = []

    if "tomato" in crop:
        if humidity >= 85:
            adv.append("🍅 Tomato: High humidity → fungal disease risk.")
        if pop >= 0.6:
            adv.append("🍅 Tomato: Rain expected → avoid irrigation.")

    if "onion" in crop and humidity >= 80:
        adv.append("🧅 Onion: Humid climate → purple blotch risk.")

    if "grape" in crop and humidity >= 85:
        adv.append("🍇 Grapes: High humidity → mildew risk.")

    if "wheat" in crop and temp >= 32:
        adv.append("🌾 Wheat: Heat stress risk → irrigation needed.")

    return "\n".join(adv) if adv else "✅ No crop-specific risk detected today."
