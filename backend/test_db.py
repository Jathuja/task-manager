import asyncio
import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    # Safely load the URI from your .env file
    client = AsyncIOMotorClient(os.getenv("DATABASE_URL"), tlsCAFile=certifi.where())
    db = client.task_manager
    projects = await db.projects.find({}).to_list(10)
    for p in projects:
        print(f"Name: {p.get('name')}, Priority: {p.get('priority', 'MISSING')}, Status: {p.get('status', 'MISSING')}")

asyncio.run(main())
