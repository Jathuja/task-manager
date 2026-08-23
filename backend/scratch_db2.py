import asyncio
from database import user_collection
from auth import get_password_hash

async def main():
    user = await user_collection.find_one({"username": "testuser2"})
    if user:
        print("Found:", user)
    else:
        print("Not found, inserting testuser2 with password 'password123'")
        new_user = {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "hashed_password": get_password_hash("password123")
        }
        await user_collection.insert_one(new_user)
        print("Inserted.")

asyncio.run(main())
