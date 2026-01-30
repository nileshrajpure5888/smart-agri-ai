import os
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from bson import ObjectId

from app.database import db
from app.services.jwt_service import admin_only, editor_or_admin


router = APIRouter(
    prefix="/api/stories",
    tags=["Stories"]
)


# ================= UPLOAD DIR =================

UPLOAD_DIR = "uploads/stories"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ================= ADD STORY =================

@router.post("/", dependencies=[Depends(editor_or_admin)])
async def add_story(
    name: str = Form(...),
    crop: str = Form(...),
    profit: str = Form(...),
    story: str = Form(...),
    image: UploadFile = File(None)
):

    filename = ""


    # Save image
    if image:

        if image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Only JPG / PNG allowed")

        ext = image.filename.split(".")[-1]

        filename = f"{uuid.uuid4()}.{ext}"

        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)


    data = {
        "name": name.strip(),
        "crop": crop.strip(),
        "profit": profit.strip(),
        "story": story.strip(),
        "image": f"/uploads/stories/{filename}" if filename else ""
    }


    db["stories"].insert_one(data)


    return {"message": "Story added successfully ✅"}


# ================= GET STORIES =================

@router.get("/")
def get_stories():

    stories = []


    for s in db["stories"].find():

        s["_id"] = str(s["_id"])

        stories.append(s)


    return stories


# ================= UPDATE STORY =================

@router.put("/{id}", dependencies=[Depends(editor_or_admin)])
async def update_story(
    id: str,
    name: str = Form(...),
    crop: str = Form(...),
    profit: str = Form(...),
    story: str = Form(...),
    image: UploadFile = File(None)
):

    story_doc = db["stories"].find_one({"_id": ObjectId(id)})

    if not story_doc:
        raise HTTPException(404, "Story not found")


    new_image = story_doc.get("image", "")


    # Replace image if uploaded
    if image:

        if image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Only JPG / PNG allowed")

        ext = image.filename.split(".")[-1]

        filename = f"{uuid.uuid4()}.{ext}"

        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)


        new_image = f"/uploads/stories/{filename}"


    db["stories"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "name": name.strip(),
            "crop": crop.strip(),
            "profit": profit.strip(),
            "story": story.strip(),
            "image": new_image
        }}
    )


    return {"message": "Story updated successfully ✅"}


# ================= DELETE =================

@router.delete("/{id}", dependencies=[Depends(admin_only)])
def delete_story(id: str):

    story = db["stories"].find_one({"_id": ObjectId(id)})

    if not story:
        raise HTTPException(404, "Story not found")


    # Delete file
    if story.get("image"):

        img_path = story["image"].replace("/uploads/", "uploads/")

        if os.path.exists(img_path):
            os.remove(img_path)


    db["stories"].delete_one({"_id": ObjectId(id)})


    return {"message": "Deleted successfully ✅"}
