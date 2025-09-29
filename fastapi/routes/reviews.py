from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import uuid
import os
import aiofiles
from database import insert_review, get_all_reviews, get_reviews_by_location, get_review_by_id

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXT = {"jpg", "jpeg", "png", "webp", "gif"}


def _secure_extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower()


@router.post("/reviews")
async def create_review(
    title: str = Form(...),
    comment: str = Form(...),
    rating: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user_id: int = Form(1),
):
    image_path = None
    if image and image.filename:
        ext = _secure_extension(image.filename)
        if ext not in ALLOWED_EXT:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        filename = f"{uuid.uuid4()}.{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        # async write
        try:
            async with aiofiles.open(image_path, "wb") as out_file:
                content = await image.read()
                await out_file.write(content)
        except Exception as e:
            # if fails, try cleanup
            if os.path.exists(image_path):
                os.remove(image_path)
            raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    try:
        review = await insert_review(
            title=title,
            comment=comment,
            rating=rating,
            latitude=latitude,
            longitude=longitude,
            address=address,
            image_path=image_path,
            user_id=user_id,
        )
        return review
    except Exception as e:
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
