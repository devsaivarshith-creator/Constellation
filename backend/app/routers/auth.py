from fastapi import APIRouter, HTTPException, Depends, status
from app.models.auth import UserLogin, UserCreate, UserResponse, Token
from app.dependencies import (
    get_user_by_username, verify_password, get_password_hash,
    create_access_token, get_current_user
)
from app.db.sqlite_client import get_db_connection
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = get_user_by_username(credentials.username)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    token = create_access_token({
        "sub": user["username"],
        "user_id": user["id"],
        "role": user["role"]
    })
    
    user_resp = UserResponse(
        id=user["id"],
        username=user["username"],
        role=user["role"],
        created_at=user["created_at"]
    )
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
