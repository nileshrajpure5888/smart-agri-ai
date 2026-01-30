from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import db
from app.services.jwt_service import get_current_user


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# ======================
# ADMIN GUARD
# ======================
def admin_only(user=Depends(get_current_user)):

    if user.get("role") != "admin":
        raise HTTPException(403, "Admins only")

    return user


# ======================
# GET ALL USERS
# ======================
@router.get("/users", dependencies=[Depends(admin_only)])
def get_users():

    users = []

    for u in db["users"].find():
        u["_id"] = str(u["_id"])
        u.pop("password", None)
        users.append(u)

    return users


# ======================
# DELETE USER
# ======================
@router.delete("/users/{user_id}", dependencies=[Depends(admin_only)])
def delete_user(user_id: str):

    result = db["users"].delete_one({
        "_id": ObjectId(user_id)
    })

    if result.deleted_count == 0:
        raise HTTPException(404, "User not found")

    return {"message": "User deleted"}
# ======================
# ADMIN STATS
# ======================
@router.get("/stats", dependencies=[Depends(admin_only)])
def get_admin_stats():

    users = db["users"].count_documents({})
    products = db["products"].count_documents({})
    orders = db["orders"].count_documents({})
    reviews = db["reviews"].count_documents({})
    stories = db["stories"].count_documents({})

    return {
        "users": users,
        "products": products,
        "orders": orders,
        "reviews": reviews,
        "stories": stories
    }
