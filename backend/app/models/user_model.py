from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"   # default


class LoginUser(BaseModel):
    email: EmailStr
    password: str
