import asyncio
from database import user_collection

async def main():
    user = await user_collection.find_one({"username": "testuser2"})
    print(user)

asyncio.run(main())
