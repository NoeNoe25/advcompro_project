from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import connect_db, disconnect_db
from init_db import init_db  # add this line

from routes.reviews import router as reviews_router
from routes.users import router as users_router

app = FastAPI(title="Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://nextjs:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(reviews_router)
app.include_router(users_router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await connect_db()
    await init_db()  # 🔥 auto create tables on startup
    print("✅ FastAPI server started and DB initialized")

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
