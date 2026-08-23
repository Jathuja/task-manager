from pydantic import BaseModel, EmailStr

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
    email: EmailStr | None = None
    old_password: str | None = None
    password: str | None = None
    full_name: str | None = None
    role: str | None = None
    department: str | None = None
    profile_picture_url: str | None = None
