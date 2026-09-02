from fastapi import APIRouter, Depends
from typing import List
from database import alerts_collection, task_collection
from auth import get_current_user
import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])

@router.get("")
async def get_alerts(current_user: dict = Depends(get_current_user)):
    user_id = current_user["username"]
    
    # First, let's dynamically generate alerts for overdue or upcoming tasks
    # In a real system, this might be a cron job, but here we evaluate on fetch for simplicity
    today = datetime.datetime.now()
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = today_start + datetime.timedelta(days=2)
    
    tasks_cursor = task_collection.find({"user_id": user_id, "status": {"$ne": "done"}})
    
    async for task in tasks_cursor:
        if task.get("due_date"):
            try:
                due_date = datetime.datetime.strptime(task["due_date"], "%Y-%m-%d")
                
                # Check Overdue
                if due_date < today_start:
                    alert_id = f"overdue_{task['id']}"
                    existing = await alerts_collection.find_one({"alert_id": alert_id, "user_id": user_id})
                    if not existing:
                        await alerts_collection.insert_one({
                            "alert_id": alert_id,
                            "user_id": user_id,
                            "title": "Task Overdue",
                            "message": f"Task '{task['title']}' is overdue.",
                            "type": "warning",
                            "is_read": False,
                            "created_at": today.isoformat()
                        })
                
                # Check Approaching (due today or tomorrow)
                elif today_start <= due_date < tomorrow_end:
                    alert_id = f"approaching_{task['id']}"
                    existing = await alerts_collection.find_one({"alert_id": alert_id, "user_id": user_id})
                    if not existing:
                        await alerts_collection.insert_one({
                            "alert_id": alert_id,
                            "user_id": user_id,
                            "title": "Deadline Approaching",
                            "message": f"Task '{task['title']}' is due soon.",
                            "type": "info",
                            "is_read": False,
                            "created_at": today.isoformat()
                        })
            except ValueError:
                pass

    # Fetch alerts
    cursor = alerts_collection.find({"user_id": user_id}).sort("created_at", -1).limit(50)
    alerts = []
    async for alert in cursor:
        alert["id"] = str(alert["_id"])
        del alert["_id"]
        alerts.append(alert)
        
    return alerts

@router.put("/{alert_id}/read")
async def mark_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(alert_id)
        await alerts_collection.update_one(
            {"_id": obj_id, "user_id": current_user["username"]},
            {"$set": {"is_read": True}}
        )
        return {"message": "Marked as read"}
    except Exception:
        return {"message": "Invalid alert ID"}

@router.delete("/clear")
async def clear_alerts(current_user: dict = Depends(get_current_user)):
    await alerts_collection.delete_many({"user_id": current_user["username"]})
    return {"message": "Alerts cleared"}
