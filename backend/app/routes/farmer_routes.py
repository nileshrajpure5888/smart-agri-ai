from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from bson.errors import InvalidId

from app.database import db
from app.services.jwt_service import get_current_user

router = APIRouter(prefix="/api/farmer", tags=["Farmer Profile"])


# -------------------------
# ✅ Pydantic model
# -------------------------
class FarmerProfileIn(BaseModel):
    full_name: str = ""
    phone: str = ""
    whatsapp: str = ""
    state: str = ""
    district: str = ""
    taluka: str = ""
    village: str = ""
    farm_size: str = ""
    crops: list[str] = []
    language: str = "mr"

    # ✅ Advanced fields
    about: str = ""
    experience_years: int = 0
    farm_type: str = "mixed"      # mixed, organic, horticulture, dairy
    profile_photo: str = ""       # "/uploads/profile/xxx.png"


# -------------------------
# ✅ Helpers
# -------------------------
def serialize_farmer(u):
    return {
        "_id": str(u.get("_id")),
        "full_name": u.get("name") or u.get("full_name") or "",
        "phone": u.get("phone", ""),
        "whatsapp": u.get("whatsapp", ""),
        "state": u.get("state", ""),
        "district": u.get("district", ""),
        "taluka": u.get("taluka", ""),
        "village": u.get("village", ""),
        "farm_size": u.get("farm_size", ""),
        "crops": u.get("crops", []),
        "language": u.get("language", "mr"),

        # ✅ Advanced
        "about": u.get("about", ""),
        "experience_years": u.get("experience_years", 0),
        "farm_type": u.get("farm_type", "mixed"),
        "profile_photo": u.get("profile_photo", ""),
    }


# -------------------------
# ✅ GET: Logged-in farmer profile
# -------------------------
@router.get("/profile/me")
def my_profile(user=Depends(get_current_user)):
    users = db["users"]

    try:
        oid = ObjectId(user["_id"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user")

    u = users.find_one({"_id": oid})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "profile": serialize_farmer(u)}


# -------------------------
# ✅ POST: Save farmer profile
# -------------------------
@router.post("/profile")
def save_profile(payload: FarmerProfileIn, user=Depends(get_current_user)):
    users = db["users"]

    try:
        oid = ObjectId(user["_id"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user")

    # ✅ normalize crops
    crops = []
    for c in payload.crops:
        if c and str(c).strip():
            crops.append(str(c).strip())

    update_data = {
        # keep name consistent
        "name": payload.full_name.strip(),
        "full_name": payload.full_name.strip(),

        "phone": payload.phone.strip(),
        "whatsapp": payload.whatsapp.strip(),
        "state": payload.state.strip(),
        "district": payload.district.strip(),
        "taluka": payload.taluka.strip(),
        "village": payload.village.strip(),

        "farm_size": payload.farm_size.strip(),
        "crops": crops,
        "language": payload.language,

        # ✅ advanced
        "about": payload.about.strip(),
        "experience_years": int(payload.experience_years or 0),
        "farm_type": payload.farm_type,
        "profile_photo": payload.profile_photo,

        "profile_completed": True,
    }

    users.update_one({"_id": oid}, {"$set": update_data})

    u = users.find_one({"_id": oid})
    if not u:
        raise HTTPException(status_code=404, detail="User not found after update")

    return {"success": True, "message": "Profile saved ✅", "profile": serialize_farmer(u)}


# -------------------------
# ✅ GET: Public farmer profile by user id
# -------------------------
@router.get("/profile/{farmer_id}")
def public_profile(farmer_id: str):
    users = db["users"]

    try:
        oid = ObjectId(farmer_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid farmer id")

    u = users.find_one({"_id": oid})
    if not u:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return {"success": True, "profile": serialize_farmer(u)}
