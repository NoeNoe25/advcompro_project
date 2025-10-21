import asyncio
from databases import Database

DATABASE_URL = "postgresql+asyncpg://temp:temp@db:5432/advcompro"
database = Database(DATABASE_URL)

# List of SQL commands
SQL_COMMANDS = [
    """
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(50) UNIQUE NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS places (
        place_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        place_id INT REFERENCES places(place_id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        comment TEXT,
        image_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS photos (
        photo_id SERIAL PRIMARY KEY,
        place_id INT REFERENCES places(place_id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    INSERT INTO categories (category_name)
    SELECT name FROM (VALUES
        ('Restaurant'), ('Cafe'), ('Park'), ('Museum'), ('Shop'),
        ('Hotel'), ('Bar'), ('Landmark'), ('Beach'), ('Mall')
    ) AS v(name)
    WHERE NOT EXISTS (SELECT 1 FROM categories);
    """
]

async def init_db():
    await database.connect()
    try:
        for sql in SQL_COMMANDS:
            await database.execute(sql)
        print("✅ All tables created successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(init_db())
