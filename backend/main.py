from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import uuid
import os
from database import task_collection, user_collection
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from schemas import UserCreate, UserResponse, Token
from datetime import timedelta

app = FastAPI(title="Task Manager API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from typing import Optional

class Task(BaseModel):
    id: int
    title: str
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None
    created_at: Optional[str] = None

def task_helper(task) -> dict:
    import datetime
    return {
        "id": task["id"],
        "title": task["title"],
        "status": task.get("status", "todo"),
        "priority": task.get("priority", "medium"),
        "due_date": task.get("due_date", None),
        "created_at": task.get("created_at", datetime.datetime.now().isoformat())
    }

@app.get("/")
def read_root():
    return {"message": "Task Manager API is running!"}

@app.get("/analytics/monthly-tasks")
async def get_monthly_analytics(current_user: dict = Depends(get_current_user)):
    import datetime
    # We will aggregate tasks created in the last 6 months
    today = datetime.datetime.now()
    months_data = []
    
    # Generate last 6 months labels
    for i in range(5, -1, -1):
        d = today - datetime.timedelta(days=30*i)
        months_data.append({"name": d.strftime("%b"), "task": 0, "month": d.month, "year": d.year})

    async for task in task_collection.find({"user_id": current_user["username"]}):
        created_str = task.get("created_at")
        if created_str:
            try:
                task_date = datetime.datetime.fromisoformat(created_str)
                # Find matching month in our data
                for m in months_data:
                    if m["month"] == task_date.month and m["year"] == task_date.year:
                        m["task"] += 1
            except:
                pass
                
    return months_data

# --- AUTH ROUTES ---

@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    try:
        existing_user = await user_collection.find_one({"username": user.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        hashed_password = get_password_hash(user.password)
        new_user = {
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_password
        }
        
        await user_collection.insert_one(new_user)
        return UserResponse(username=user.username, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        import traceback, sys
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- GOOGLE OAUTH ---
from fastapi.responses import RedirectResponse
import os
import httpx

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://127.0.0.1:8000/auth/google/callback"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@app.get("/auth/google/login")
async def google_login():
    return RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline"
    )

@app.get("/auth/google/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_response.json()
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token from Google")

        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        user_info = user_info_response.json()

    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Failed to get email from Google")

    # Find or create user
    user = await user_collection.find_one({"email": email})
    if not user:
        # Create a new user with Google email
        username = email.split('@')[0]
        # Check if username exists, if so append something random
        existing_username = await user_collection.find_one({"username": username})
        if existing_username:
            username = f"{username}_{user_info.get('id', '')[-4:]}"
        
        new_user = {
            "username": username,
            "email": email,
            "hashed_password": "", # OAuth users don't have a password
            "google_id": user_info.get("id")
        }
        await user_collection.insert_one(new_user)
        user = new_user

    access_token = create_access_token(data={"sub": user["username"]})
    return RedirectResponse(url=f"{FRONTEND_URL}?token={access_token}")

# --- PASSWORD RESET ---
from schemas import ForgotPasswordRequest, ResetPasswordRequest
from auth import create_reset_token, verify_reset_token

@app.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await user_collection.find_one({"email": req.email})
    if not user:
        # Return success anyway to prevent email enumeration
        return {"message": "If that email is registered, a password reset link has been sent."}
    
    reset_token = create_reset_token(req.email)
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    # In a real app, send an email here. For now, print to console.
    print(f"--- PASSWORD RESET EMAIL SIMULATION ---")
    print(f"To: {req.email}")
    print(f"Link: {reset_link}")
    print(f"---------------------------------------")
    
    return {"message": "If that email is registered, a password reset link has been sent."}

@app.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    email = verify_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = get_password_hash(req.new_password)
    await user_collection.update_one({"email": email}, {"$set": {"hashed_password": hashed_password}})
    return {"message": "Password reset successfully"}

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        username=current_user["username"], 
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        role=current_user.get("role"),
        department=current_user.get("department"),
        profile_picture_url=current_user.get("profile_picture_url")
    )

from schemas import UserUpdate
@app.put("/users/update", response_model=UserResponse)
async def update_user(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_fields = {}
    
    if update_data.email:
        update_fields["email"] = update_data.email
        
    if update_data.password:
        if not update_data.old_password:
            raise HTTPException(status_code=400, detail="Old password is required to set a new password")
        
        # Verify old password
        db_user = await user_collection.find_one({"username": current_user["username"]})
        if not verify_password(update_data.old_password, db_user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Incorrect old password")
            
        update_fields["hashed_password"] = get_password_hash(update_data.password)
        
    if update_data.full_name is not None:
        update_fields["full_name"] = update_data.full_name
        
    if update_data.role is not None:
        update_fields["role"] = update_data.role
        
    if update_data.department is not None:
        update_fields["department"] = update_data.department
        
    if update_data.profile_picture_url is not None:
        update_fields["profile_picture_url"] = update_data.profile_picture_url
        
    if update_fields:
        await user_collection.update_one(
            {"username": current_user["username"]},
            {"$set": update_fields}
        )
        
    updated_user = await user_collection.find_one({"username": current_user["username"]})
    return updated_user

@app.post("/users/profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Create unique filename
    import uuid
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    
    # Save the file
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # Generate public URL (assuming server runs on localhost:8000)
    file_url = f"http://127.0.0.1:8000/uploads/{filename}"
    
    # Update user in database
    await user_collection.update_one(
        {"username": current_user["username"]},
        {"$set": {"profile_picture_url": file_url}}
    )
    
    return {"profile_picture_url": file_url}

# --- TASK ROUTES ---

@app.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = []
    # Only fetch tasks belonging to the current user
    async for task in task_collection.find({"user_id": current_user["username"]}):
        tasks.append(task_helper(task))
    return tasks

@app.get("/tasks/pending", response_model=List[Task])
async def get_pending_tasks(current_user: dict = Depends(get_current_user)):
    tasks = []
    async for task in task_collection.find({"status": {"$ne": "done"}, "user_id": current_user["username"]}):
        tasks.append(task_helper(task))
    return tasks

@app.post("/tasks", response_model=Task)
async def add_task(task: Task, current_user: dict = Depends(get_current_user)):
    existing_task = await task_collection.find_one({"id": task.id, "user_id": current_user["username"]})
    if existing_task:
        raise HTTPException(status_code=400, detail="Task with this ID already exists")
    
    import datetime
    task_dict = task.model_dump()
    task_dict["user_id"] = current_user["username"]
    task_dict["created_at"] = task_dict.get("created_at") or datetime.datetime.now().isoformat()
    
    await task_collection.insert_one(task_dict)
    return task

@app.put("/tasks/{task_id}", response_model=Task)
async def complete_task(task_id: int, task_update: Task, current_user: dict = Depends(get_current_user)):
    updated_task = await task_collection.find_one_and_update(
        {"id": task_id, "user_id": current_user["username"]},
        {"$set": {
            "status": task_update.status,
            "title": task_update.title,
            "priority": task_update.priority,
            "due_date": task_update.due_date
        }},
        return_document=True
    )
    if updated_task:
        return task_helper(updated_task)
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, current_user: dict = Depends(get_current_user)):
    delete_result = await task_collection.delete_one({"id": task_id, "user_id": current_user["username"]})
    if delete_result.deleted_count == 1:
        return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")
