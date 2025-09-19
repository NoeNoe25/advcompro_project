from databases import Database

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'

database = Database(DATABASE_URL)

async def connect_db():
   await database.connect()
   print("Database connected")

async def disconnect_db():
   await database.disconnect()
   print("Database disconnected")

# User functions
async def insert_user(username: str, password_hash: str, email: str):
   query = """
   INSERT INTO users (username, password_hash, email)
   VALUES (:username, :password_hash, :email)
   RETURNING user_id, username, password_hash, email, created_at
   """
   values = {"username": username, "password_hash": password_hash, "email": email}
   return await database.fetch_one(query=query, values=values)

async def get_user(username: str):
   query = "SELECT * FROM users WHERE username = :username"
   return await database.fetch_one(query=query, values={"username": username})

async def get_user_by_email(email: str, password_hash: str):
   query = "SELECT * FROM users WHERE email = :email and password_hash = :password_hash"
   return await database.fetch_one(query=query, values={"email": email, "password_hash": password_hash})

async def update_user(user_id: int, username: str, password_hash: str, email: str):
   query = """
   UPDATE users
   SET username = :username, password_hash = :password_hash, email = :email
   WHERE user_id = :user_id
   RETURNING user_id, username, password_hash, email, created_at
   """
   values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
   return await database.fetch_one(query=query, values=values)

async def delete_user(user_id: int):
   query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
   return await database.fetch_one(query=query, values={"user_id": user_id})

# Review functions
async def insert_review(title: str, comment: str, rating: int, latitude: float, 
                       longitude: float, address: str, image_path: str, user_id: int):
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
       "user_id": user_id
   }
   return await database.fetch_one(query=query, values=values)

async def get_all_reviews():
   query = """
   SELECT r.*, u.username 
   FROM reviews r 
   JOIN users u ON r.user_id = u.user_id 
   ORDER BY r.created_at DESC
   """
   return await database.fetch_all(query=query)

async def get_reviews_by_location(latitude: float, longitude: float):
   query = """
   SELECT r.*, u.username 
   FROM reviews r 
   JOIN users u ON r.user_id = u.user_id 
   WHERE r.latitude = :latitude AND r.longitude = :longitude 
   ORDER BY r.created_at DESC
   """
   values = {"latitude": latitude, "longitude": longitude}
   return await database.fetch_all(query=query, values=values)

async def get_review_by_id(review_id: int):
   query = """
   SELECT r.*, u.username 
   FROM reviews r 
   JOIN users u ON r.user_id = u.user_id 
   WHERE r.review_id = :review_id
   """
   values = {"review_id": review_id}
   return await database.fetch_one(query=query, values=values)