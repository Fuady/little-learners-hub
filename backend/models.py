"""
Pydantic models for the KidLearn API
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    parent = "parent"
    educator = "educator"


class MaterialType(str, Enum):
    worksheet = "worksheet"
    activity_book = "activity_book"
    drawing = "drawing"
    puzzle = "puzzle"
    game = "game"


class GradeLevel(str, Enum):
    kindergarten = "kindergarten"
    grade1 = "grade1"
    grade2 = "grade2"
    grade3 = "grade3"
    grade4 = "grade4"
    grade5 = "grade5"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class User(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


# Auth Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"


# Material Models
class MaterialBase(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10, max_length=500)
    type: MaterialType
    grade_level: GradeLevel
    is_interactive: bool = False
    tags: list[str] = []


class MaterialCreate(MaterialBase):
    pass


class Material(MaterialBase):
    id: str
    thumbnail: str
    download_url: Optional[str] = None
    author_id: str
    author_name: str
    created_at: datetime
    downloads: int = 0
    likes: int = 0

    class Config:
        from_attributes = True


class MaterialList(BaseModel):
    items: list[Material]
    total: int


# Stats Models
class Stats(BaseModel):
    total_materials: int
    total_downloads: int
    total_users: int
    grade_breakdown: dict[str, int]


# Response Models
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None


class DownloadResponse(BaseModel):
    url: str


class LikeResponse(BaseModel):
    likes: int
