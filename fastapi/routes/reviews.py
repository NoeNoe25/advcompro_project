from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
import uuid
import os
from database import insert_review, get_all_reviews, get_reviews_by_location, get_review_by_id

router = APIRouter()

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@router.post("/reviews")
async def create_review(
    title: str = Form(...),
    comment: str = Form(...),
    rating: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    image: Optional[UploadFile] = File(None),
    # In a real app, you would get user_id from authentication
    user_id: int = Form(1)  # Default to user 1 for demo
):
    # Handle image upload
    image_path = None
    if image and image.filename:
        # Generate unique filename
        file_extension = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        image_path = f"uploads/{filename}"
        
        # Save the file
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
    
    # Insert review into database
    try:
        review = await insert_review(
            title=title,
            comment=comment,
            rating=rating,
            latitude=latitude,
            longitude=longitude,
            address=address,
            image_path=image_path,
            user_id=user_id
        )
        return review
    except Exception as e:
        # Clean up uploaded file if there was an error
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reviews")
async def read_reviews(latitude: Optional[float] = None, longitude: Optional[float] = None):
    try:
        if latitude is not None and longitude is not None:
            reviews = await get_reviews_by_location(latitude, longitude)
        else:
            reviews = await get_all_reviews()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reviews/{review_id}")
async def read_review(review_id: int):
    try:
        review = await get_review_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))