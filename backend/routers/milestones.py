from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import milestone_collection
from auth import get_current_user
from schemas import MilestoneCreate, MilestoneResponse
from bson import ObjectId
import datetime

router = APIRouter(prefix="/api/v1/milestones", tags=["milestones"])

def milestone_helper(milestone) -> dict:
    return {
        "id": str(milestone["_id"]),
        "name": milestone["name"],
        "project_id": milestone["project_id"],
        "status": milestone.get("status", "Pending"),
        "due_date": milestone.get("due_date", None),
        "created_at": milestone.get("created_at", "")
    }

@router.get("", response_model=List[MilestoneResponse])
async def get_milestones(project_id: str = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if project_id:
        query["project_id"] = project_id
    milestones = []
    async for milestone in milestone_collection.find(query):
        milestones.append(milestone_helper(milestone))
    return milestones

@router.post("", response_model=MilestoneResponse)
async def create_milestone(milestone: MilestoneCreate, current_user: dict = Depends(get_current_user)):
    new_milestone = {
        "name": milestone.name,
        "project_id": milestone.project_id,
        "status": milestone.status,
        "due_date": milestone.due_date,
        "created_at": datetime.datetime.now().isoformat()
    }
    result = await milestone_collection.insert_one(new_milestone)
    new_milestone["_id"] = result.inserted_id
    return milestone_helper(new_milestone)

@router.delete("/{milestone_id}")
async def delete_milestone(milestone_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(milestone_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid milestone ID format")
        
    delete_result = await milestone_collection.delete_one({"_id": obj_id})
    if delete_result.deleted_count == 1:
        return {"message": "Milestone deleted successfully"}
    raise HTTPException(status_code=404, detail="Milestone not found")
