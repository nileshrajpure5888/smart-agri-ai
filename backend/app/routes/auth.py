from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext

from app.database import users_col
from app.models.user_model import RegisterUser, LoginUser
from app.services.jwt_service import create_access_token, get_current_user


router = APIRouter(prefix="/api/auth", tags=["Auth"])

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ======================
# REGISTER
# ======================
@router.post("/register")
def register(user: RegisterUser):

    if users_col.find_one({"email": user.email}):
        raise HTTPException(400, "Email already exists")

    hashed = pwd.hash(user.password)

    data = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "role": user.role or "user"   # safe default
    }

    res = users_col.insert_one(data)

    token = create_access_token({
        "user_id": str(res.inserted_id),
        "role": data["role"]
    })

    return {
        "message": "Registered Successfully",
        "token": token,
        "role": data["role"]
    }


# ======================
# LOGIN
# ======================
@router.post("/login")
def login(user: LoginUser):

    db_user = users_col.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(401, "Invalid credentials")

    if not pwd.verify(user.password, db_user["password"]):
        raise HTTPException(401, "Invalid credentials")


    # SAFE ROLE
    role = db_user.get("role", "user")


    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "role": role
    })


    return {
        "message": "Login Successful",
        "token": token,
        "role": role,
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }


# ======================
# PROFILE
# ======================
@router.get("/me")
def me(user=Depends(get_current_user)):
    return user
