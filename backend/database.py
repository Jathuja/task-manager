import os
import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # Loads variables from .env file

MONGO_DETAILS = os.getenv("DATABASE_URL")

client = AsyncIOMotorClient(MONGO_DETAILS, tlsCAFile=certifi.where())
database = client.task_manager

# Collections
task_collection = database.get_collection("tasks")
project_collection = database.get_collection("projects")
user_collection = database.get_collection("users")
