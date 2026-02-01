from fastapi import APIRouter, Form, Depends, HTTPException
from bson import ObjectId

from app.database import db
from app.services.jwt_service import admin_only, editor_or_admin


router = APIRouter(
    prefix="/api/stories",
    tags=["Stories"]
)


# ================= ADD STORY =================

@router.post("/", dependencies=[Depends(editor_or_admin)])
async def add_story(
    name: str = Form(...),
    crop: str = Form(...),
    profit: str = Form(...),
    story: str = Form(...)
):

    # Validation
    if not name.strip() or not crop.strip() or not story.strip():
        raise HTTPException(400, "All fields are required")


    data = {
        "name": name.strip(),
        "crop": crop.strip(),
        "profit": profit.strip(),
        "story": story.strip()
    }


    db["stories"].insert_one(data)


    return {"message": "Story added successfully ✅"}


# ================= GET STORIES =================

@router.get("/")
def get_stories():

    stories = []


    for s in db["stories"].find().sort("_id", -1):

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
    story: str = Form(...)
):

    story_doc = db["stories"].find_one({"_id": ObjectId(id)})

    if not story_doc:
        raise HTTPException(404, "Story not found")


    # Validation
    if not name.strip() or not crop.strip() or not story.strip():
        raise HTTPException(400, "All fields are required")


    db["stories"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "name": name.strip(),
            "crop": crop.strip(),
            "profit": profit.strip(),
            "story": story.strip()
        }}
    )


    return {"message": "Story updated successfully ✅"}


# ================= DELETE =================

@router.delete("/{id}", dependencies=[Depends(admin_only)])
def delete_story(id: str):

    story = db["stories"].find_one({"_id": ObjectId(id)})

    if not story:
        raise HTTPException(404, "Story not found")


    db["stories"].delete_one({"_id": ObjectId(id)})


    return {"message": "Deleted successfully ✅"}
