import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncIOMotorClient(os.getenv("DATABASE_URL"), tlsCAFile=certifi.where())
    db = client.task_manager
    user = await db.users.find_one({"email": "test2@user.com"})
    if user:
        old_username = user.get('username')
        print(f"Found user with email test2@user.com, current username is: {old_username}")
        # Reset back to testuser2
        await db.users.update_one({"email": "test2@user.com"}, {"$set": {"username": "testuser2"}})
        
        # We also need to update tasks that might have the old username
        result = await db.tasks.update_many({"user_id": old_username}, {"$set": {"user_id": "testuser2"}})
        print(f"Reset username to testuser2 and updated {result.modified_count} tasks.")
    else:
        print("User not found.")

asyncio.run(main())
