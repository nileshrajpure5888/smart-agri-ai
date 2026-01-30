from fastapi import APIRouter, Query
from datetime import datetime
from pydantic import BaseModel

from app.database import db

router = APIRouter(prefix="/api/activity", tags=["Activity"])
activity_collection = db["activity_logs"]


class ActivityLog(BaseModel):
    user_id: str
    title: str
    description: str = ""
    icon: str = "✅"


@router.post("/log")
def log_activity(payload: ActivityLog):
    data = payload.dict()
    data["created_at"] = datetime.utcnow()

    result = activity_collection.insert_one(data)
    return {"message": "Activity logged ✅", "id": str(result.inserted_id)}


@router.get("/recent")
def recent_activity(
    user_id: str = Query(...),
    limit: int = 5,
):
    activities = list(
        activity_collection.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )

    for a in activities:
        a["_id"] = str(a["_id"])
        a["created_at"] = a["created_at"].isoformat()

    return {"user_id": user_id, "results": activities}
