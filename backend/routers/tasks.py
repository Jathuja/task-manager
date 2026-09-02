from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import task_collection
from auth import get_current_user
from schemas import TaskCreate, TaskResponse
from bson import ObjectId
import datetime
from routers.activity import log_activity

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

def task_helper(task) -> dict:
    return {
        "id": task["id"],
        "title": task["title"],
        "status": task.get("status", "todo"),
        "priority": task.get("priority", "medium"),
        "due_date": task.get("due_date", None),
        "project_id": task.get("project_id", None),
        "category": task.get("category", None),
        "order": task.get("order", 0),
        "assignee_id": task.get("assignee_id", None),
        "created_at": task.get("created_at", datetime.datetime.now().isoformat())
    }

@router.get("", response_model=List[TaskResponse])
async def get_tasks(project_id: str = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["username"]}
    if project_id:
        query["project_id"] = project_id
    tasks = []
    async for task in task_collection.find(query):
        tasks.append(task_helper(task))
    return tasks

@router.post("", response_model=TaskResponse)
async def add_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    existing_task = await task_collection.find_one({"id": task.id, "user_id": current_user["username"]})
    if existing_task:
        raise HTTPException(status_code=400, detail="Task with this ID already exists")
    
    task_dict = task.model_dump()
    task_dict["user_id"] = current_user["username"]
    task_dict["created_at"] = datetime.datetime.now().isoformat()
    
    await task_collection.insert_one(task_dict)
    
    # Log activity
    if task_dict.get("project_id"):
        await log_activity(
            "Task Created", 
            f"Created task '{task_dict['title']}'", 
            current_user["username"], 
            task_dict["project_id"]
        )
        
    return task_dict

from websocket_manager import manager
import json

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskCreate, current_user: dict = Depends(get_current_user)):
    updated_task = await task_collection.find_one_and_update(
        {"id": task_id, "user_id": current_user["username"]},
        {"$set": {
            "status": task_update.status,
            "title": task_update.title,
            "priority": task_update.priority,
            "due_date": task_update.due_date,
            "category": task_update.category,
            "order": task_update.order,
            "assignee_id": task_update.assignee_id
        }},
        return_document=True
    )
    if updated_task:
        task_data = task_helper(updated_task)
        # Broadcast notification via WebSocket
        notification_msg = json.dumps({
            "type": "task_update",
            "message": f"Task '{task_data['title']}' was updated.",
            "task_id": task_id,
            "status": task_data["status"]
        })
        await manager.send_personal_message(notification_msg, current_user["username"])
        
        # Log activity
        if task_data.get("project_id"):
            await log_activity(
                "Task Updated", 
                f"Updated task '{task_data['title']}' to status '{task_data['status']}'", 
                current_user["username"], 
                task_data["project_id"]
            )
            
        return task_data
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{task_id}")
async def delete_task(task_id: int, current_user: dict = Depends(get_current_user)):
    # First get the task to log it
    task = await task_collection.find_one({"id": task_id, "user_id": current_user["username"]})
    
    delete_result = await task_collection.delete_one({"id": task_id, "user_id": current_user["username"]})
    if delete_result.deleted_count == 1:
        if task and task.get("project_id"):
            await log_activity(
                "Task Deleted", 
                f"Deleted task '{task['title']}'", 
                current_user["username"], 
                task["project_id"]
            )
        return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")

@router.get("/progress/{project_id}")
async def get_project_progress(project_id: str, current_user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"project_id": project_id, "user_id": current_user["username"]}},
        {"$group": {
            "_id": "$category",
            "total": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "done"]}, 1, 0]}}
        }}
    ]
    progress_data = await task_collection.aggregate(pipeline).to_list(length=100)
    return progress_data
