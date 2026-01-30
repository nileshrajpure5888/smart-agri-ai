def get_disease_details(disease_name: str):
    disease = (disease_name or "").lower()

    data = {
        "healthy": {
            "info": "Your plant is healthy ✅ Continue regular irrigation and care.",
            "causes": ["No disease detected"],
            "organic_treatment": ["Keep leaf clean", "Ensure good sunlight"],
            "chemical_treatment": ["No chemical required ✅"],
            "spray_schedule": ["Only preventive spray if needed"],
            "fertilizer_advice": ["Use balanced NPK (19:19:19) once in 15 days"],
        },
        "unknown": {
            "info": "Disease not clearly detected. Upload clearer leaf image.",
            "causes": ["Blur photo", "Low light", "Wrong leaf angle"],
            "organic_treatment": ["Neem oil spray", "Remove affected leaf"],
            "chemical_treatment": ["Consult agriculture expert"],
            "spray_schedule": ["Spray once every 7 days if symptoms continue"],
            "fertilizer_advice": ["Avoid excess nitrogen fertilizer"],
        },
    }

    # ✅ match
    for key in data:
        if key in disease:
            return data[key]

    return data["unknown"]
