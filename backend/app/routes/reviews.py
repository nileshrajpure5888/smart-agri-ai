from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from app.database import db
from app.services.jwt_service import admin_only


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)


# =====================
# ADD REVIEW (PUBLIC)
# =====================
@router.post("/")
def add_review(data: dict):

    if not data.get("name") or not data.get("review"):
        raise HTTPException(400, "Name and review required")

    review = {
        "name": data["name"],
        "place": data.get("place", ""),
        "review": data["review"],
        "rating": data.get("rating", 5),
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    db["reviews"].insert_one(review)

    return {"message": "Review submitted for approval"}


# =====================
# GET ALL REVIEWS (ADMIN)
# =====================
@router.get("/", dependencies=[Depends(admin_only)])
def get_all_reviews():

    reviews = []

    for r in db["reviews"].find():
        r["_id"] = str(r["_id"])
        reviews.append(r)

    return reviews


# =====================
# GET APPROVED REVIEWS (PUBLIC)
# =====================
@router.get("/approved")
def get_approved():

    reviews = []

    for r in db["reviews"].find({"status": "approved"}):
        r["_id"] = str(r["_id"])
        reviews.append(r)

    return reviews


# =====================
# GET PENDING REVIEWS (ADMIN)
# =====================
@router.get("/pending", dependencies=[Depends(admin_only)])
def get_pending():

    reviews = []

    for r in db["reviews"].find({"status": "pending"}):
        r["_id"] = str(r["_id"])
        reviews.append(r)

    return reviews


# =====================
# APPROVE REVIEW (ADMIN)
# =====================
@router.put("/{id}/approve", dependencies=[Depends(admin_only)])
def approve_review(id: str):

    result = db["reviews"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "approved"}}
    )

    if result.modified_count == 0:
        raise HTTPException(404, "Review not found")

    return {"message": "Approved"}


# =====================
# DELETE REVIEW (ADMIN)
# =====================
@router.delete("/{id}", dependencies=[Depends(admin_only)])
def delete_review(id: str):

    result = db["reviews"].delete_one({"_id": ObjectId(id)})

    if result.deleted_count == 0:
        raise HTTPException(404, "Review not found")

    return {"message": "Deleted"}
