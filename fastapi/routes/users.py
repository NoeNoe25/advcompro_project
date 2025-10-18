from fastapi import APIRouter, FastAPI, HTTPException, Request, Response, Depends, status
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from database import *  # Ensure your database functions are imported
from auth import get_password_hash_str, verify_password_str, create_access_token, get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


# Pydantic model for user creation
class UserCreate(BaseModel):
   username: str
   email: str
   password: str
   
   @field_validator('password')
   def validate_password(cls, v: str) -> str:
    # password_bytes = v.encode('utf-8')
    
    # # Truncate safely to 72 bytes without breaking characters
    # if len(password_bytes) > 72:
    #     truncated = password_bytes[:72]
    #     # Decode, ignoring incomplete characters at the end
    #     v = truncated.decode('utf-8', errors='ignore')
    
    # Ensure minimum length (after safe truncation)
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    return v


# Pydantic model for user update
class UserUpdate(BaseModel):
   username: Optional[str] = None
   password_hash: Optional[str] = None
   email: Optional[str] = None


# Pydantic model for user response
class User(BaseModel):
   user_id: int
   username: str
   password_hash: str
   email: str
   created_at: datetime


# Pydantic model for login
class UserLogin(BaseModel):
   email: str
   password: str
   remember_me: bool


class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str


# Endpoint to create a new user
@router.post("/create")
async def create_user(user: UserCreate):
    try:
        # Check if user already exists
        existing = await get_user_by_email(user.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash the password (already truncated by validator)

        hashed = get_password_hash_str(user.password)
        
        # Insert user into database
        result = await insert_user(user.username, hashed, user.email)

        if not result:
            raise HTTPException(status_code=500, detail="Error creating user")

        # Return success with user data (excluding password hash)
        return {
            "message": "User created successfully",
            "user": {
                "user_id": result["user_id"],
                "username": result["username"],
                "email": result["email"],
                "created_at": result["created_at"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {"user": current_user}


# Endpoint to get a user by user_id
@router.get("/{user_id}", response_model=User)
async def read_user(user_id: int):
   result = await get_user(user_id)
   if result is None:
       raise HTTPException(status_code=404, detail="User not found")
   return result


# Endpoint to update a user
@router.put("/{user_id}", response_model=User)
async def update_user_endpoint(user_id: int, user: UserUpdate):
   result = await update_user(user_id, user.username, user.password_hash, user.email)
   if result is None:
       raise HTTPException(status_code=404, detail="User not found")
   return result


# Endpoint to delete a user
@router.delete("/{user_id}")
async def delete_user_endpoint(user_id: int):
   result = await delete_user(user_id)
   if result is None:
       raise HTTPException(status_code=404, detail="User not found")
   return {"detail": "User deleted"}


# Endpoint for user login
@router.post("/login")
async def login_user(user: UserLogin, response: Response):
    db_user = await get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    remember_me = user.remember_me

    # Truncate password to 72 bytes for verification
    password_bytes = user.password.encode('utf-8')[:72]
    # password_truncated = password_bytes.decode('utf-8', errors='ignore')
    
    if not verify_password_str(password_bytes, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"id": db_user["user_id"], "email": db_user["email"]}, remember_me)

    # Set JWT in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # True in production (HTTPS)
        samesite="Lax",
        max_age=60 * 60 * 24,  # 1 day
        domain = None,
        path = "/"
    )

    return {"message": "Login successful", "user": {"user_id": db_user["user_id"], "username": db_user["username"], "email": db_user["email"]}}



@router.post("/logout")
async def logout_user(request: Request, response: Response):
    # Get access_token cookie from request
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in"
        )

    # Cookie exists → delete it
    response.delete_cookie(
        key="access_token",
        path="/",
        domain=None
    )

    return {"message": "Logged out successfully"}