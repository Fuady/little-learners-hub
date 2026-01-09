"""
Stats router for KidLearn API
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Stats
from ..database import get_stats

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("", response_model=Stats)
async def get_platform_stats(db: AsyncSession = Depends(get_db)):
    """Get overall platform statistics"""
    stats = await get_stats(db)
    
    return Stats(
        total_materials=stats["total_materials"],
        total_downloads=stats["total_downloads"],
        total_users=stats["total_users"],
        grade_breakdown=stats["grade_breakdown"],
    )
