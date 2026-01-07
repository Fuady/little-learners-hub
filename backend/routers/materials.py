"""
Materials router for KidLearn API
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..models import (
    User,
    Material,
    MaterialCreate,
    MaterialList,
    MaterialType,
    GradeLevel,
    DownloadResponse,
    LikeResponse,
    UserRole,
)
from ..database import (
    get_materials,
    get_material_by_id,
    create_material,
    increment_downloads,
    increment_likes,
)
from .auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.get("", response_model=MaterialList)
async def list_materials(
    type: Optional[MaterialType] = Query(None, description="Filter by material type"),
    grade_level: Optional[GradeLevel] = Query(None, alias="gradeLevel", description="Filter by grade level"),
    search: Optional[str] = Query(None, description="Search in title, description, and tags"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
):
    """Get a list of all materials with optional filters"""
    materials, total = get_materials(
        material_type=type,
        grade_level=grade_level,
        search=search,
        limit=limit,
        offset=offset,
    )
    
    return MaterialList(items=materials, total=total)


@router.get("/{material_id}", response_model=Material)
async def get_material(material_id: str):
    """Get detailed information about a specific material"""
    material = get_material_by_id(material_id)
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    
    return material


@router.post("", response_model=Material, status_code=201)
async def submit_material(
    material_data: MaterialCreate,
    current_user: User = Depends(get_current_user),
):
    """Submit a new educational material (educators only)"""
    if current_user.role != UserRole.educator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only educators can submit materials",
        )
    
    material = create_material(
        author_id=current_user.id,
        author_name=current_user.name,
        title=material_data.title,
        description=material_data.description,
        material_type=material_data.type,
        grade_level=material_data.grade_level,
        is_interactive=material_data.is_interactive,
        tags=material_data.tags,
    )
    
    return material


@router.post("/{material_id}/download", response_model=DownloadResponse)
async def download_material(material_id: str):
    """Get the download URL for a material"""
    downloads = increment_downloads(material_id)
    
    if downloads is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    
    material = get_material_by_id(material_id)
    download_url = material.download_url or f"/materials/{material_id}/download-file"
    
    return DownloadResponse(url=download_url)


@router.post("/{material_id}/like", response_model=LikeResponse)
async def like_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
):
    """Add a like to a material"""
    likes = increment_likes(material_id)
    
    if likes is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    
    return LikeResponse(likes=likes)
