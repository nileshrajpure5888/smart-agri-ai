from fastapi import APIRouter
from pydantic import BaseModel
from rapidfuzz import fuzz

import os, json, re
from dotenv import load_dotenv

# Optional OpenAI
try:
    from openai import OpenAI
except:
    OpenAI = None


router = APIRouter(prefix="/api/crop", tags=["Crop Recommendation"])


# ======================================================
# ✅ Schemas
# ======================================================

class SimpleCropInput(BaseModel):
    location: str
    season: str
    soil_type: str
    water: str


class VoiceTextInput(BaseModel):
    text: str


# ======================================================
# ✅ SMART RECOMMENDATION ENGINE
# ======================================================

@router.post("/simple-predict")
def smart_predict_crop(data: SimpleCropInput):

    season = data.season.lower()
    soil = data.soil_type.lower()
    water = data.water.lower()


    # 🌱 Crop Knowledge Base
    CROP_DB = [

        {
            "name": "Rice",
            "seasons": ["kharif"],
            "soil": ["clay", "black"],
            "water": "high",
            "duration": "120-150 days",
            "profit": "₹40k-₹70k/acre"
        },

        {
            "name": "Soybean",
            "seasons": ["kharif"],
            "soil": ["black"],
            "water": "medium",
            "duration": "90-110 days",
            "profit": "₹25k-₹50k/acre"
        },

        {
            "name": "Wheat",
            "seasons": ["rabi"],
            "soil": ["black", "red"],
            "water": "medium",
            "duration": "110-140 days",
            "profit": "₹30k-₹60k/acre"
        },

        {
            "name": "Cotton",
            "seasons": ["kharif"],
            "soil": ["black"],
            "water": "medium",
            "duration": "150-180 days",
            "profit": "₹35k-₹80k/acre"
        },

        {
            "name": "Onion",
            "seasons": ["rabi"],
            "soil": ["black", "red"],
            "water": "medium",
            "duration": "110-150 days",
            "profit": "₹40k-₹1L/acre"
        },

        {
            "name": "Maize",
            "seasons": ["kharif", "summer"],
            "soil": ["sandy", "red"],
            "water": "medium",
            "duration": "90-120 days",
            "profit": "₹25k-₹55k/acre"
        },

        {
            "name": "Bajra (Pearl Millet)",
            "seasons": ["kharif", "summer"],
            "soil": ["sandy"],
            "water": "low",
            "duration": "70-90 days",
            "profit": "₹15k-₹35k/acre"
        },

        {
            "name": "Gram (Chana)",
            "seasons": ["rabi"],
            "soil": ["black", "red"],
            "water": "low",
            "duration": "100-120 days",
            "profit": "₹25k-₹55k/acre"
        },
    ]


    scored_crops = []


    for crop in CROP_DB:

        score = 0
        reasons = []


        # ✅ Season
        if season in crop["seasons"]:
            score += 30
            reasons.append("Suitable season")


        # ✅ Soil
        if soil in crop["soil"]:
            score += 25
            reasons.append("Good soil type")


        # ✅ Water
        if water == crop["water"]:
            score += 20
            reasons.append("Water matched")


        # ✅ Market Bonus (Simulated)
        score += 15
        reasons.append("Good market demand")


        # ⚠️ Risk Level
        if water == crop["water"]:
            risk = "Low"
        elif water == "low" and crop["water"] == "high":
            risk = "High"
        else:
            risk = "Medium"


        scored_crops.append({
            "crop": crop["name"],
            "duration": crop["duration"],
            "profit": crop["profit"],
            "score": score,
            "risk": risk,
            "reasons": reasons
        })


    # 🔢 Sort by score
    scored_crops.sort(key=lambda x: x["score"], reverse=True)


    return {
        "location": data.location,
        "season": data.season,
        "soil_type": data.soil_type,
        "water": data.water,
        "top_3_crops": scored_crops[:3]
    }



# ======================================================
# ✅ VOICE HELPERS
# ======================================================

def fuzzy_match(text: str, keywords: list[str], threshold=75):

    for kw in keywords:
        if fuzz.partial_ratio(text, kw) >= threshold:
            return True

    return False



def extract_json(text: str):

    cleaned = re.sub(r"```json|```", "", text).strip()

    try:
        return json.loads(cleaned)
    except:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass

    return None



def fallback_parse_voice(text: str):

    t = text.lower()


    season_map = {
        "Kharif": ["खरीप", "खरीफ", "kharif"],
        "Rabi": ["रब्बी", "रबी", "rabi"],
        "Summer": ["उन्हाळ", "उन्हाळा", "summer"]
    }


    soil_map = {
        "Black": ["काळी जमीन", "काळी माती", "black soil"],
        "Red": ["लाल जमीन", "लाल माती", "red soil"],
        "Sandy": ["वाळू", "वालुकामय", "sandy soil"],
        "Clay": ["चिकण माती", "clay soil"]
    }


    water_map = {
        "Low": ["पाणी कमी", "low water"],
        "Medium": ["पाणी मध्यम", "medium water"],
        "High": ["पाणी जास्त", "high water"]
    }


    location_map = {
        "Pune": ["पुणे", "pune"],
        "Nashik": ["नाशिक", "nashik"],
        "Nagpur": ["नागपूर", "nagpur"],
        "Mumbai": ["मुंबई", "mumbai"]
    }


    detected = {
        "location": None,
        "season": None,
        "soil_type": None,
        "water": None
    }


    for loc, words in location_map.items():
        if fuzzy_match(t, words, 80):
            detected["location"] = loc


    for s, words in season_map.items():
        if fuzzy_match(t, words):
            detected["season"] = s


    for s, words in soil_map.items():
        if fuzzy_match(t, words):
            detected["soil_type"] = s


    for w, words in water_map.items():
        if fuzzy_match(t, words):
            detected["water"] = w


    return detected



# ======================================================
# ✅ AI + FALLBACK VOICE PARSER
# ======================================================

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = None

if OpenAI and OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)



@router.post("/parse-voice-smart")
def parse_voice_smart(data: VoiceTextInput):


    # 🤖 Try AI First
    if client:

        try:

            prompt = f"""
You are an Indian agriculture assistant.

Return ONLY JSON.

Keys:
location, season, soil_type, water

Allowed:
season = Kharif/Rabi/Summer
soil_type = Black/Red/Sandy/Clay
water = Low/Medium/High

If missing → null.

Text: {data.text}
"""

            res = client.chat.completions.create(

                model="gpt-4o-mini",

                messages=[{"role": "user", "content": prompt}],

                temperature=0
            )


            content = res.choices[0].message.content

            parsed = extract_json(content)


            if parsed:
                parsed["method"] = "ai"
                return parsed

        except:
            pass


    # 🔁 Fallback
    fallback = fallback_parse_voice(data.text)
    fallback["method"] = "offline"

    return fallback
