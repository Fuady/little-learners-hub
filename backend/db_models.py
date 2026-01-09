from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base
from .models import UserRole, MaterialType, GradeLevel

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String) # Stored as string, validated by enum in app
    avatar: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    materials: Mapped[List["Material"]] = relationship(back_populates="author")


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String) # Enum
    grade_level: Mapped[str] = mapped_column(String) # Enum
    thumbnail: Mapped[str] = mapped_column(String)
    download_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_interactive: Mapped[bool] = mapped_column(Boolean, default=False)
    author_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    author_name: Mapped[str] = mapped_column(String) # De-normalized for convenience or fetch via rel
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    downloads: Mapped[int] = mapped_column(Integer, default=0)
    likes: Mapped[int] = mapped_column(Integer, default=0)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)

    # Relationships
    author: Mapped["User"] = relationship(back_populates="materials")
