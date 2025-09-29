# database.py
from databases import Database
from typing import Optional, Any

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"      # change to 'localhost' if not using docker
POSTGRES_PORT = 5432      # add port if needed

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

database = Database(DATABASE_URL)


async def connect_db() -> None:
    await database.connect()
    print("Database connected")


async def disconnect_db() -> None:
    await database.disconnect()
    print("Database disconnected")


# User functions
async def insert_user(username: str, password_hash: str, email: str) -> Any:
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)


async def get_user(username: str) -> Optional[Any]:
    query = "SELECT * FROM users WHERE username = :username"
    return await database.fetch_one(query=query, values={"username": username})


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


# Review functions
async def insert_review(
    title: str,
    comment: str,
    rating: int,
    latitude: float,
    longitude: float,
    address: str,
    image_path: str | None,
    user_id: int,
) -> Any:
    query = """
    INSERT INTO reviews (title, comment, rating, latitude, longitude, address, image_path, user_id)
    VALUES (:title, :comment, :rating, :latitude, :longitude, :address, :image_path, :user_id)
    RETURNING review_id, title, comment, rating, latitude, longitude, address, image_path, created_at, user_id
    """
    values = {
        "title": title,
        "comment": comment,
        "rating": rating,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "image_path": image_path,
        "user_id": user_id,
    }
    return await database.fetch_one(query=query, values=values)


async def get_all_reviews() -> list:
    query = """
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.user_id 
    ORDER BY r.created_at DESC
    """
    return await database.fetch_all(query=query)


async def get_reviews_by_location(latitude: float, longitude: float) -> list:
    # Note: equality on floats can be brittle; consider a bounding-box or distance-based query for production.
    query = """
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.user_id 
    WHERE r.latitude = :latitude AND r.longitude = :longitude 
    ORDER BY r.created_at DESC
    """
    values = {"latitude": latitude, "longitude": longitude}
    return await database.fetch_all(query=query, values=values)


async def get_review_by_id(review_id: int) -> Optional[Any]:
    query = """
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.user_id 
    WHERE r.review_id = :review_id
    """
    values = {"review_id": review_id}
    return await database.fetch_one(query=query, values=values)
