from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import project_collection
from auth import get_current_user
from schemas import ProjectCreate, ProjectResponse
from bson import ObjectId
import datetime

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

def project_helper(project) -> dict:
    return {
        "id": str(project["_id"]),
        "name": project["name"],
        "category": project.get("category", "General"),
        "description": project.get("description", ""),
        "priority": project.get("priority", "Medium"),
        "status": project.get("status", "Planning"),
        "owner_id": project["owner_id"],
        "created_at": project.get("created_at", "")
    }

@router.get("", response_model=List[ProjectResponse])
async def get_projects(category: str = None, current_user: dict = Depends(get_current_user)):
    query = {"owner_id": current_user["username"]}
    if category:
        query["category"] = category
    projects = []
    async for project in project_collection.find(query):
        projects.append(project_helper(project))
    return projects

@router.post("", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    new_project = {
        "name": project.name,
        "category": project.category,
        "description": project.description,
        "priority": project.priority,
        "status": project.status,
        "owner_id": current_user["username"],
        "created_at": datetime.datetime.now().isoformat()
    }
    result = await project_collection.insert_one(new_project)
    new_project["_id"] = result.inserted_id
    return project_helper(new_project)
@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    delete_result = await project_collection.delete_one({"_id": obj_id, "owner_id": current_user["username"]})
    if delete_result.deleted_count == 1:
        return {"message": "Project deleted successfully"}
    raise HTTPException(status_code=404, detail="Project not found")

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_update: ProjectCreate, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    updated_project = await project_collection.find_one_and_update(
        {"_id": obj_id, "owner_id": current_user["username"]},
        {"$set": {
            "name": project_update.name,
            "category": project_update.category,
            "description": project_update.description,
            "priority": project_update.priority,
            "status": project_update.status
        }},
        return_document=True
    )
    if updated_project:
        return project_helper(updated_project)
    raise HTTPException(status_code=404, detail="Project not found")
