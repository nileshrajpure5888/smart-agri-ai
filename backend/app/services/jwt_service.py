import os
from dotenv import load_dotenv
from jose import jwt, JWTError
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.database import db


load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise ValueError("JWT_SECRET missing in .env")

ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24  # 1 day

security = HTTPBearer()


# ======================
# CREATE TOKEN
# ======================
def create_access_token(data: dict):

    payload = data.copy()

    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)

    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


# ======================
# VERIFY TOKEN
# ======================
def verify_access_token(token: str):

    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])

    except JWTError:
        return None


# ======================
# CURRENT USER
# ======================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(401, "Invalid token")

    user = db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(401, "User not found")

    # Default role
    user["role"] = user.get("role", "user")

    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return user


# ======================
# ADMIN ONLY
# ======================
def admin_only(user=Depends(get_current_user)):

    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")

    return user


# ======================
# EDITOR / ADMIN
# ======================
def editor_or_admin(user=Depends(get_current_user)):

    if user.get("role") not in ["admin", "editor"]:
        raise HTTPException(403, "Permission denied")

    return user

