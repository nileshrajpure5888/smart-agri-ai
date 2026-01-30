from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from bson import ObjectId

from app.database import db
from app.services.notify_service import send_whatsapp

router = APIRouter(prefix="/api/calendar", tags=["Crop Calendar"])


# ✅ Generate crop schedule tasks
def generate_tasks(crop_name: str, sowing_date: datetime):
    crop = (crop_name or "").lower()

    tasks = []

    # ✅ General tasks
    tasks.append({
        "task_title": "Seed Treatment",
        "task_type": "seed",
        "task_date": sowing_date,
        "notes": "Treat seeds with recommended fungicide before sowing.",
        "is_done": False
    })

    # ✅ Irrigation reminders
    tasks.append({
        "task_title": "1st Irrigation Reminder",
        "task_type": "irrigation",
        "task_date": sowing_date + timedelta(days=3),
        "notes": "Check soil moisture and provide light irrigation if needed.",
        "is_done": False
    })

    tasks.append({
        "task_title": "Regular Irrigation Check",
        "task_type": "irrigation",
        "task_date": sowing_date + timedelta(days=7),
        "notes": "Check irrigation schedule. Increase/decrease based on weather.",
        "is_done": False
    })

    # ✅ Fertilizer reminders
    tasks.append({
        "task_title": "1st Fertilizer (NPK)",
        "task_type": "fertilizer",
        "task_date": sowing_date + timedelta(days=15),
        "notes": "Apply fertilizer based on crop stage and soil test.",
        "is_done": False
    })

    tasks.append({
        "task_title": "2nd Fertilizer / Top Dressing",
        "task_type": "fertilizer",
        "task_date": sowing_date + timedelta(days=30),
        "notes": "Top dressing as per crop requirement (N / Potash).",
        "is_done": False
    })

    # ✅ Pest monitoring / spray reminders
    tasks.append({
        "task_title": "Pest Monitoring",
        "task_type": "spray",
        "task_date": sowing_date + timedelta(days=20),
        "notes": "Monitor pests. Spray only if required.",
        "is_done": False
    })

    tasks.append({
        "task_title": "Disease Monitoring",
        "task_type": "spray",
        "task_date": sowing_date + timedelta(days=25),
        "notes": "Monitor leaf spots/fungal symptoms. Use preventive spray if needed.",
        "is_done": False
    })

    # ✅ Weeding
    tasks.append({
        "task_title": "Weeding / Intercultivation",
        "task_type": "weeding",
        "task_date": sowing_date + timedelta(days=18),
        "notes": "Weeding to reduce competition and pests.",
        "is_done": False
    })

    # ✅ Harvest (basic logic)
    harvest_days = 90
    if "tomato" in crop:
        harvest_days = 70
    elif "onion" in crop:
        harvest_days = 95
    elif "wheat" in crop:
        harvest_days = 120

    tasks.append({
        "task_title": "Harvest Window Start",
        "task_type": "harvest",
        "task_date": sowing_date + timedelta(days=harvest_days),
        "notes": "Harvest depends on maturity and market demand.",
        "is_done": False
    })

    return tasks


# ✅ Create Crop Calendar
@router.post("/create")
def create_calendar(user_id: str, crop_name: str, sowing_date: str):
    try:
        sow_date = datetime.strptime(sowing_date, "%Y-%m-%d")
    except:
        raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

    # ✅ Save calendar
    calendar = {
        "user_id": user_id,
        "crop_name": crop_name,
        "sowing_date": sow_date,
        "created_at": datetime.utcnow()
    }

    cal_insert = db["crop_calendars"].insert_one(calendar)
    calendar_id = str(cal_insert.inserted_id)

    # ✅ Generate tasks & insert
    tasks = generate_tasks(crop_name, sow_date)

    for t in tasks:
        t["calendar_id"] = calendar_id
        t["user_id"] = user_id
        t["created_at"] = datetime.utcnow()

    if tasks:
        db["crop_tasks"].insert_many(tasks)

    return {
        "message": "Crop Calendar created ✅",
        "calendar_id": calendar_id,
        "tasks_created": len(tasks)
    }


# ✅ Get all tasks by user
@router.get("/tasks/{user_id}")
def get_tasks(user_id: str):
    tasks = list(db["crop_tasks"].find({"user_id": user_id}).sort("task_date", 1))

    for t in tasks:
        t["_id"] = str(t["_id"])
        # Convert datetime to ISO string for frontend
        if "task_date" in t and isinstance(t["task_date"], datetime):
            t["task_date"] = t["task_date"].isoformat()

    return tasks


# ✅ Mark task done
@router.put("/task-done/{task_id}")
def mark_task_done(task_id: str):
    res = db["crop_tasks"].update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"is_done": True}}
    )

    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task marked as done ✅"}


# ✅ Send WhatsApp Reminder manually (for testing)
@router.post("/send-reminder-now/{user_id}")
def send_reminder_now(user_id: str):
    user = db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    whatsapp = user.get("whatsapp")
    name = user.get("name", "Farmer")

    if not whatsapp:
        raise HTTPException(status_code=400, detail="Phone/WhatsApp not set in profile")

    today = datetime.utcnow().strftime("%Y-%m-%d")

    tasks = list(db["crop_tasks"].find({
        "user_id": user_id,
        "is_done": False
    }))

    todays_tasks = []
    for t in tasks:
        td = t.get("task_date")
        if td and isinstance(td, datetime) and td.strftime("%Y-%m-%d") == today:
            todays_tasks.append(t)

    if len(todays_tasks) == 0:
        return {"message": "No pending tasks for today ✅"}

    msg = f"🌾 Smart Agri Reminder\nHello {name} 👋\n\n✅ Today's Tasks:\n"
    for i, t in enumerate(todays_tasks, start=1):
        msg += f"{i}) {t.get('task_title')} ({t.get('task_type')})\n"
    msg += "\nGood luck ✅"

    try:
        send_whatsapp(whatsapp, msg)
        return {"message": "WhatsApp reminder sent ✅"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
