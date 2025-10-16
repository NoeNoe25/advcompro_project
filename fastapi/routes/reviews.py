# routes/reviews.py
from fastapi import APIRouter, UploadFile, Form, HTTPException
from database import *
import shutil
import os
import time

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("/")
async def get_reviews(latitude: float = None, longitude: float = None):
    if latitude and longitude:
        # Get reviews for a specific location
        query = """
        SELECT r.*, u.username as user_name, p.name as place_name, p.address,
               p.latitude, p.longitude, r.image_path, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN places p ON r.place_id = p.place_id
        WHERE p.latitude BETWEEN :lat_min AND :lat_max 
          AND p.longitude BETWEEN :lng_min AND :lng_max
        ORDER BY r.created_at DESC
        """
        # Search within ~1km radius
        lat_range = 0.009  # ~1km
        lng_range = 0.009  # ~1km
        values = {
            "lat_min": latitude - lat_range,
            "lat_max": latitude + lat_range,
            "lng_min": longitude - lng_range,
            "lng_max": longitude + lng_range
        }
    else:
        # Get all reviews
        query = """
        SELECT r.*, u.username as user_name, p.name as place_name, p.address,
               p.latitude, p.longitude, r.image_path, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN places p ON r.place_id = p.place_id
        ORDER BY r.created_at DESC
        """
        values = {}
    
    return await database.fetch_all(query=query, values=values)

@router.post("/")
async def add_review(
    title: str = Form(...),
    comment: str = Form(...),
    rating: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    user_id: int = Form(...),
    image: UploadFile = None,
):
    try:
        # First, find or create a place
        place = await get_place_by_location(latitude, longitude)
        if not place:
            # Create a new place (using category_id=1 as default, you might want to make this dynamic)
            place = await insert_place(
                name=title,  # Using title as place name, you might want to separate this
                category_id=1,
                address=address,
                latitude=latitude,
                longitude=longitude
            )
        
        # Handle image upload
        image_path = None
        if image and image.filename:
            os.makedirs("uploads", exist_ok=True)
            # Create unique filename to avoid conflicts
            file_extension = os.path.splitext(image.filename)[1]
            unique_filename = f"{user_id}_{int(time.time())}{file_extension}"
            image_path = f"uploads/{unique_filename}"
            
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

        # Create the review
        query = """
        INSERT INTO reviews (user_id, place_id, rating, comment, image_path, created_at)
        VALUES (:user_id, :place_id, :rating, :comment, :image_path, NOW())
        RETURNING review_id, user_id, place_id, rating, comment, image_path, created_at
        """
        values = {
            "user_id": user_id,
            "place_id": place["place_id"],
            "rating": rating,
            "comment": comment,
            "image_path": image_path,
        }
        
        review = await database.fetch_one(query=query, values=values)
        
        return {
            "message": "Review added successfully", 
            "review_id": review["review_id"],
            "id": review["review_id"],  # For frontend compatibility
            "title": title,  # Include title in response
            "user_name": "User",  # You might want to fetch actual username
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "image_path": image_path,
            "created_at": review["created_at"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding review: {str(e)}")