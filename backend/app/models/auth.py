from typing import Optional
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field("investigator", pattern="^(admin|investigator|read_only)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = ""

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    full_name: Optional[str] = ""
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
