from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from app.database import db
from app.services.jwt_service import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Order Requests"])


@router.post("/request")
def create_order_request(payload: dict, user=Depends(get_current_user)):
    products_col = db["products"]
    orders_col = db["order_requests"]

    product_id = payload.get("product_id")
    message = payload.get("message", "मला हा product घ्यायचा आहे.")

    if not product_id:
        raise HTTPException(status_code=400, detail="product_id required")

    product = products_col.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.get("status") != "available":
        raise HTTPException(status_code=400, detail="Product not available")

    if product.get("seller_id") == user["_id"]:
        raise HTTPException(status_code=400, detail="You cannot request your own product")

    existing = orders_col.find_one({
        "product_id": product_id,
        "buyer_id": user["_id"],
        "status": {"$in": ["pending", "accepted"]}
    })

    if existing:
        raise HTTPException(status_code=400, detail="Request already exists")

    order = {
        "product_id": product_id,
        "product_title": product.get("title", ""),
        "seller_id": product.get("seller_id"),
        "seller_name": product.get("seller_name", ""),
        "buyer_id": user["_id"],
        "buyer_name": user.get("name", ""),
        "buyer_email": user.get("email", ""),
        "message": message,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    inserted = orders_col.insert_one(order)
    return {"message": "Request sent ✅", "request_id": str(inserted.inserted_id)}


@router.get("/my-requests")
def my_requests(user=Depends(get_current_user)):
    orders_col = db["order_requests"]
    items = list(orders_col.find({"buyer_id": user["_id"]}).sort("created_at", -1))

    for i in items:
        i["_id"] = str(i["_id"])

    return {"requests": items}


@router.get("/inbox")
def seller_inbox(user=Depends(get_current_user)):
    orders_col = db["order_requests"]
    items = list(orders_col.find({"seller_id": user["_id"]}).sort("created_at", -1))

    for i in items:
        i["_id"] = str(i["_id"])

    return {"requests": items}


@router.patch("/{request_id}/accept")
def accept_request(request_id: str, user=Depends(get_current_user)):
    orders_col = db["order_requests"]

    req = orders_col.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req["seller_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    orders_col.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}}
    )
    return {"message": "Accepted ✅"}


@router.patch("/{request_id}/reject")
def reject_request(request_id: str, user=Depends(get_current_user)):
    orders_col = db["order_requests"]

    req = orders_col.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req["seller_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    orders_col.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}}
    )
    return {"message": "Rejected ✅"}
