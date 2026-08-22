from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from database import task_collection

app = FastAPI(title="Task Manager API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    title: str
    completed: bool = False

def task_helper(task) -> dict:
    return {
        "id": task["id"],
        "title": task["title"],
        "completed": task["completed"],
    }

@app.get("/")
def read_root():
    return {"message": "Task Manager API is running!"}

@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    tasks = []
    async for task in task_collection.find():
        tasks.append(task_helper(task))
    return tasks

@app.get("/tasks/pending", response_model=List[Task])
async def get_pending_tasks():
    tasks = []
    async for task in task_collection.find({"completed": False}):
        tasks.append(task_helper(task))
    return tasks

@app.post("/tasks", response_model=Task)
async def add_task(task: Task):
    existing_task = await task_collection.find_one({"id": task.id})
    if existing_task:
        raise HTTPException(status_code=400, detail="Task with this ID already exists")
    
    await task_collection.insert_one(task.model_dump())
    return task

@app.put("/tasks/{task_id}", response_model=Task)
async def complete_task(task_id: int):
    updated_task = await task_collection.find_one_and_update(
        {"id": task_id},
        {"$set": {"completed": True}},
        return_document=True
    )
    if updated_task:
        return task_helper(updated_task)
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    delete_result = await task_collection.delete_one({"id": task_id})
    if delete_result.deleted_count == 1:
        return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")
