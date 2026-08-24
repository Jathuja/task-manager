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
        "owner_id": current_user["username"],
        "created_at": datetime.datetime.now().isoformat()
    }
    result = await project_collection.insert_one(new_project)
    new_project["_id"] = result.inserted_id
    return project_helper(new_project)
