from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    role: str | None = None
    department: str | None = None
    profile_picture_url: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    old_password: str | None = None
    password: str | None = None
    full_name: str | None = None
    role: str | None = None
    department: str | None = None
    profile_picture_url: str | None = None

class ProjectCreate(BaseModel):
    name: str
    category: str = "General"
    description: Optional[str] = None
    priority: str = "Medium"
    status: str = "Planning"

class ProjectResponse(ProjectCreate):
    id: str
    owner_id: str
    created_at: str

class TaskBase(BaseModel):
    title: str
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None
    project_id: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = 0
    assignee_id: Optional[str] = None

class TaskCreate(TaskBase):
    id: int | str

class TaskResponse(TaskBase):
    id: int | str
    created_at: Optional[str] = None
