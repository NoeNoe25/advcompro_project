# database.py
from databases import Database
from typing import Optional, Any
import asyncio

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"
POSTGRES_PORT = 5432

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
database = Database(DATABASE_URL)

async def connect_db():
    max_retries = 10
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            await database.connect()
            print(f"✓ Database connected successfully!")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠ Database connection attempt {attempt + 1}/{max_retries} failed. Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"✗ Failed to connect to database after {max_retries} attempts")
                raise e


async def disconnect_db() -> None:
    await database.disconnect()
    print("Database disconnected")


# ---------------- USERS ---------------- #

async def insert_user(username: str, password_hash: str, email: str) -> Any:
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    return await database.fetch_one(query=query, values={"username": username, "password_hash": password_hash, "email": email})

# async def get_user(username: str) -> Optional[Any]:
#     query = "SELECT * FROM users WHERE username = :username"
#     return await database.fetch_one(query=query, values={"username": username})

async def get_user(user_id: int) -> Optional[Any]:
    query = "SELECT * FROM users WHERE user_id = :user_id"
    return await database.fetch_one(query=query, values={"user_id": user_id})

async def get_user_by_email(email: str) -> Optional[Any]:
    query = "SELECT * FROM users WHERE email = :email"
    return await database.fetch_one(query=query, values={"email": email})

async def update_user(user_id: int, username: str, password_hash: str, email: str) -> Any:
    query = """
    UPDATE users
    SET username = :username, password_hash = :password_hash, email = :email
    WHERE user_id = :user_id
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

async def delete_user(user_id: int) -> Any:
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
    return await database.fetch_one(query=query, values={"user_id": user_id})


# ---------------- PLACES ---------------- #

async def insert_place(name: str, category_id: int, address: str, latitude: float, longitude: float) -> Any:
    query = """
    INSERT INTO places (name, category_id, address, latitude, longitude)
    VALUES (:name, :category_id, :address, :latitude, :longitude)
    RETURNING place_id, name, category_id, address, latitude, longitude, created_at
    """
    values = {"name": name, "category_id": category_id, "address": address, "latitude": latitude, "longitude": longitude}
    return await database.fetch_one(query=query, values=values)

async def get_place_by_location(latitude: float, longitude: float) -> Optional[Any]:
    query = "SELECT * FROM places WHERE latitude = :latitude AND longitude = :longitude"
    return await database.fetch_one(query=query, values={"latitude": latitude, "longitude": longitude})


# ---------------- REVIEWS ---------------- #

async def insert_review(user_id: int, place_id: int, rating: int, comment: str) -> Any:
    query = """
    INSERT INTO reviews (user_id, place_id, rating, comment, review_date)
    VALUES (:user_id, :place_id, :rating, :comment, NOW())
    RETURNING review_id, user_id, place_id, rating, comment, review_date
    """
    values = {"user_id": user_id, "place_id": place_id, "rating": rating, "comment": comment}
    return await database.fetch_one(query=query, values=values)

async def get_all_reviews() -> list:
    query = """
    SELECT r.*, u.username, p.name AS place_name 
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    JOIN places p ON r.place_id = p.place_id
    ORDER BY r.review_date DESC
    """
    return await database.fetch_all(query=query)

async def get_review_by_id(review_id: int) -> Optional[Any]:
    query = """
    SELECT r.*, u.username, p.name AS place_name
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    JOIN places p ON r.place_id = p.place_id
    WHERE r.review_id = :review_id
    """
    return await database.fetch_one(query=query, values={"review_id": review_id})


# ---------------- PHOTOS ---------------- #

async def insert_photo(place_id: int, user_id: int, photo_url: str) -> Any:
    query = """
    INSERT INTO photos (place_id, user_id, photo_url, uploaded_at)
    VALUES (:place_id, :user_id, :photo_url, NOW())
    RETURNING photo_id, place_id, user_id, photo_url, uploaded_at
    """
    return await database.fetch_one(query=query, values={"place_id": place_id, "user_id": user_id, "photo_url": photo_url})


# Add to database.py in the PLACES section

async def get_or_create_place(name: str, address: str, latitude: float, longitude: float, category_id: int = 1) -> Any:
    # First try to find existing place
    existing_place = await get_place_by_location(latitude, longitude)
    if existing_place:
        return existing_place
    
    # Create new place if not exists
    return await insert_place(name, category_id, address, latitude, longitude)