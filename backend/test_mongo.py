import asyncio
from database import client
async def test():
    try:
        await client.admin.command('ping')
        print("Connected successfully!")
    except Exception as e:
        print("Failed to connect:")
        print(e)
asyncio.run(test())
