# backend/models/user_model.py
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional


# Schema for registering or viewing user data (without the password hash)
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, nullable=False)
    full_name: str
    is_active: bool = Field(default=True)

# Database table model - contains the hashed password
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

# Pydantic model for user registration input
class UserCreate(UserBase):
    password: str

# Pydantic model for login input
class UserLogin(SQLModel):
    email: str
    password: str

# Pydantic model for successful response (token)
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"