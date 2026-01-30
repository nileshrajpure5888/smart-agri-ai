from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from app.database import db
from app.models.user_model import RegisterUser, LoginUser
from app.services.jwt_service import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])   # ✅ MUST BE router

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/test-db")
def test_db():
    users_count = db["users"].count_documents({})
    return {"message": "MongoDB Connected ✅", "users_count": users_count}


@router.post("/register")
def register(user: RegisterUser):
    users_collection = db["users"]

    # ✅ check existing user
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    inserted = users_collection.insert_one(new_user)

    # ✅ create JWT token using mongo _id
    token = create_access_token({"user_id": str(inserted.inserted_id)})

    return {
        "message": "User registered successfully ✅",
        "token": token
    }


@router.post("/login")
def login(user: LoginUser):
    users_collection = db["users"]

    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": str(db_user["_id"])})

    return {
        "message": "Login successful ✅",
        "token": token,
        "user": {
            "_id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }
