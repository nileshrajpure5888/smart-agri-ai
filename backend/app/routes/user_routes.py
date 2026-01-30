from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import db
from app.services.geocode_service import geocode_city

router = APIRouter(prefix="/api/user", tags=["User"])

@router.put("/update-phone/{user_id}")
def update_phone(user_id: str, phone: str):
    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"whatsapp": phone, "phone": phone}}
    )
    return {"message": "Phone updated ✅"}

@router.put("/update-location/{user_id}")
def update_location(user_id: str, city: str):
    loc = geocode_city(city)
    if not loc:
        raise HTTPException(status_code=400, detail="City not found ❌")

    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"location": loc}}
    )

    return {"message": "Location updated ✅", "location": loc}
