from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.database import find_user_by_email, create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Worker" # Worker, HSE Officer, Admin
    site_id: Optional[str] = "OIL-DULIAJAN-01"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    existing = await find_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )
    
    hashed_pwd = get_password_hash(req.password)
    user_data = {
        "name": req.name,
        "email": req.email.lower().strip(),
        "hashed_password": hashed_pwd,
        "role": req.role if req.role in ["Admin", "HSE Officer", "Worker"] else "Worker",
        "site_id": req.site_id or "OIL-DULIAJAN-01"
    }
    
    user = await create_user(user_data)
    token = create_access_token(user["id"], user["role"])
    
    user_copy = dict(user)
    user_copy.pop("hashed_password", None)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_copy
    }

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await find_user_by_email(req.email)
    if not user or not verify_password(req.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token = create_access_token(user["id"], user["role"])
    user_copy = dict(user)
    user_copy.pop("hashed_password", None)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_copy
    }

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    user_copy = dict(current_user)
    user_copy.pop("hashed_password", None)
    return user_copy
