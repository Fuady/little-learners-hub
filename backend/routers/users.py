"""
Users router for KidLearn API
"""

from fastapi import APIRouter, Depends

from ..models import User
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile"""
    return current_user
