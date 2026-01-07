"""
Stats router for KidLearn API
"""

from fastapi import APIRouter

from ..models import Stats
from ..database import get_stats

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=Stats)
async def get_platform_stats():
    """Get overall platform statistics"""
    stats = get_stats()
    
    return Stats(
        total_materials=stats["total_materials"],
        total_downloads=stats["total_downloads"],
        total_users=stats["total_users"],
        grade_breakdown=stats["grade_breakdown"],
    )
