from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import activity_collection
from auth import get_current_user
import datetime

router = APIRouter(prefix="/api/v1/activity", tags=["activity"])

@router.get("")
async def get_activity(project_id: str = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["username"]}
    if project_id:
        query["project_id"] = project_id
    
    # Sort by created_at descending, limit to 20
    cursor = activity_collection.find(query).sort("created_at", -1).limit(20)
    activities = []
    async for act in cursor:
        act["id"] = str(act["_id"])
        del act["_id"]
        activities.append(act)
    return activities

async def log_activity(action: str, description: str, user_id: str, project_id: str = None):
    new_activity = {
        "action": action,
        "description": description,
        "user_id": user_id,
        "project_id": project_id,
        "created_at": datetime.datetime.now().isoformat()
    }
    await activity_collection.insert_one(new_activity)
