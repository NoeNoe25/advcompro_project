# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import connect_db, disconnect_db

# Import your router correctly
from routes.reviews import router as reviews_router

app = FastAPI(title="Review API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://nextjs:3000"],  # Add both
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - THIS IS CRITICAL
app.include_router(reviews_router)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await connect_db()
    print("✅ FastAPI server started with reviews routes")

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

@app.get("/")
async def root():
    return {"message": "Review API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Test if reviews endpoint exists
@app.get("/test-reviews")
async def test_reviews():
    return {"message": "Reviews endpoint test"}