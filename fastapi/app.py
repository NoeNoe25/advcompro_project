from typing import Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import *
from routes.users import router
from routes.reviews import router as reviews_router  # Fixed import path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, 
    allow_methods=["*"],     
    allow_headers=["*"],    
)

# Include routers
app.include_router(reviews_router, prefix="/api")  # This should come first if you want /api/reviews
app.include_router(router, prefix="/api")          # This will handle /api/users, etc.

# Serve uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await connect_db()
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()