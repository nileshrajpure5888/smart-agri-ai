import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")
PLANT_ID_URL = "https://api.plant.id/v3/health_assessment"


async def plantid_health_assessment(image_bytes: bytes):
    if not PLANT_ID_API_KEY:
        raise Exception("PLANT_ID_API_KEY missing in backend .env")

    b64img = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "images": [b64img],
        "health": "only",
        "similar_images": True,
    }

    headers = {
        "Api-Key": PLANT_ID_API_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(PLANT_ID_URL, json=payload, headers=headers)

    # ✅ Plant.id returns 201 (Created) sometimes
    if res.status_code not in [200, 201]:
        raise Exception(f"Plant.id API error {res.status_code}: {res.text}")

    return res.json()
