from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from app.database import db
from app.services.jwt_service import get_current_user

router = APIRouter(prefix="/api/products", tags=["Marketplace Products"])


# ✅ Create Product
@router.post("/create")
def create_product(payload: dict, user=Depends(get_current_user)):
    products = db["products"]

    title = payload.get("title")
    price = payload.get("price")
    quantity = payload.get("quantity")

    if not title or price is None or quantity is None:
        raise HTTPException(status_code=400, detail="title/price/quantity required")

    doc = {
        "title": title,
        "category": payload.get("category", "Vegetables"),
        "description": payload.get("description", ""),
        "price": float(price),
        "quantity": float(quantity),
        "unit": payload.get("unit", "kg"),
        "district": payload.get("district", ""),
        "taluka": payload.get("taluka", ""),
        "village": payload.get("village", ""),
        "contact_phone": payload.get("contact_phone", ""),
        "whatsapp": payload.get("whatsapp", ""),
        "images": payload.get("images", []),

        # ✅ seller data
        "seller_id": user["_id"],
        "seller_name": user.get("name", "Farmer"),

        "status": "available",
        "created_at": datetime.utcnow(),
    }

    inserted = products.insert_one(doc)
    return {"message": "Product listed ✅", "product_id": str(inserted.inserted_id)}


# ✅ ✅ My listings  (🔥 MUST BE ABOVE /{product_id})
@router.get("/my")
def my_products(user=Depends(get_current_user)):
    products = db["products"]
    items = list(products.find({"seller_id": user["_id"]}).sort("created_at", -1))

    for i in items:
        i["_id"] = str(i["_id"])

    return {"products": items}


# ✅ Marketplace listing with filters (🔥 use "/" not "")
@router.get("/")
def list_products(
    search: Optional[str] = "",
    category: Optional[str] = "",
    district: Optional[str] = "",
    max_price: Optional[float] = 50000,
):
    products = db["products"]

    q = {"status": "available"}

    if search:
        q["title"] = {"$regex": search, "$options": "i"}
    if category:
        q["category"] = category
    if district:
        q["district"] = {"$regex": district, "$options": "i"}
    if max_price is not None:
        q["price"] = {"$lte": float(max_price)}

    items = list(products.find(q).sort("created_at", -1))

    for i in items:
        i["_id"] = str(i["_id"])

    return {"products": items}


# ✅ Single product details
@router.get("/{product_id}")
def product_details(product_id: str):
    products = db["products"]

    # ✅ Fix invalid ObjectId crash
    try:
        oid = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product id")

    p = products.find_one({"_id": oid})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    p["_id"] = str(p["_id"])
    return {"product": p}


# ✅ Mark sold
@router.patch("/{product_id}/mark-sold")
def mark_sold(product_id: str, user=Depends(get_current_user)):
    products = db["products"]

    try:
        oid = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product id")

    p = products.find_one({"_id": oid})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if p["seller_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    products.update_one({"_id": oid}, {"$set": {"status": "sold"}})
    return {"message": "Marked sold ✅"}


# ✅ Delete product
@router.delete("/{product_id}")
def delete_product(product_id: str, user=Depends(get_current_user)):
    products = db["products"]

    try:
        oid = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product id")

    p = products.find_one({"_id": oid})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if p["seller_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    products.delete_one({"_id": oid})
    return {"message": "Deleted ✅"}
