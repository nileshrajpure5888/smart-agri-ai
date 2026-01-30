import os
import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from app.services.jwt_service import get_current_user

router = APIRouter(prefix="/api/upload", tags=["Upload"])

PRODUCT_UPLOAD_DIR = "uploads/products"
PROFILE_UPLOAD_DIR = "uploads/profile"


# ✅ 1) Upload Product Images (Max 5)
@router.post("/product-images")
async def upload_product_images(
    files: List[UploadFile] = File(...),
    user=Depends(get_current_user),
):
    os.makedirs(PRODUCT_UPLOAD_DIR, exist_ok=True)

    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Max 5 images allowed")

    urls = []

    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files allowed")

        ext = os.path.splitext(file.filename)[-1].lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(PRODUCT_UPLOAD_DIR, filename)

        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        urls.append(f"/uploads/products/{filename}")

    return {"success": True, "message": "Uploaded ✅", "urls": urls}


# ✅ 2) Upload Farmer Profile Photo (Single image)
@router.post("/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    # ✅ allow only safe extensions
    ext = os.path.splitext(file.filename)[-1].lower()
    allowed = [".jpg", ".jpeg", ".png", ".webp"]
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only jpg/jpeg/png/webp allowed")

    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(PROFILE_UPLOAD_DIR, filename)

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    url = f"/uploads/profile/{filename}"

    return {"success": True, "message": "Profile photo uploaded ✅", "url": url}
