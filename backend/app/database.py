import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL:
    raise ValueError("MONGO_URL missing in .env")

if not DB_NAME:
    raise ValueError("DB_NAME missing in .env")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_col = db["users"]
