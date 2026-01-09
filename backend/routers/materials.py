"""
Materials router for KidLearn API
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
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
from .auth import get_current_user

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.get("", response_model=MaterialList)
async def list_materials(
    type: Optional[MaterialType] = Query(None, description="Filter by material type"),
    grade_level: Optional[GradeLevel] = Query(None, alias="gradeLevel", description="Filter by grade level"),
    search: Optional[str] = Query(None, description="Search in title, description, and tags"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
):
    """Get a list of all materials with optional filters"""
    materials_db, total = await get_materials(
        db,
        material_type=type,
        grade_level=grade_level,
        search=search,
        limit=limit,
        offset=offset,
    )
    
    # Convert DB models to Pydantic models
    materials = [Material.model_validate(m) for m in materials_db]
    
    return MaterialList(items=materials, total=total)


@router.get("/{material_id}", response_model=Material)
async def get_material(
    material_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific material"""
    material_db = await get_material_by_id(db, material_id)
    
    if not material_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    
    return Material.model_validate(material_db)


import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query, Form, File, UploadFile

# ... other imports ...

@router.post("", response_model=Material, status_code=201)
async def submit_material(
    title: str = Form(...),
    description: str = Form(...),
    type: MaterialType = Form(...),
    grade_level: GradeLevel = Form(..., alias="grade_level"),
    is_interactive: bool = Form(False),
    tags_json: str = Form("[]", alias="tags"),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a new educational material (educators only)"""
    if current_user.role != UserRole.educator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only educators can submit materials",
        )
    
    try:
        tags = json.loads(tags_json)
    except Exception:
        tags = []

    download_url = None
    if file:
        import uuid
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        
        # Ensure directory exists (redundant with main.py but safe)
        upload_dir = os.path.join("backend", "uploads", "materials")
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file_name)
        with open(file_path, "wb") as buffer:
            import shutil
            shutil.copyfileobj(file.file, buffer)
        
        download_url = f"/uploads/materials/{file_name}"
    
    material_db = await create_material(
        db,
        author_id=current_user.id,
        author_name=current_user.name,
        title=title,
        description=description,
        material_type=type,
        grade_level=grade_level,
        is_interactive=is_interactive,
        tags=tags,
        download_url=download_url,
    )
    
    return Material.model_validate(material_db)


@router.post("/{material_id}/download", response_model=DownloadResponse)
async def download_material(
    material_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the download URL for a material"""
    # Verify existence first
    material_db = await get_material_by_id(db, material_id)
    if not material_db:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )

    # Increment downloads
    downloads = await increment_downloads(db, material_id)
    
    download_url = material_db.download_url or f"/materials/{material_id}/download-file"
    
    return DownloadResponse(url=download_url)


@router.post("/{material_id}/like", response_model=LikeResponse)
async def like_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a like to a material"""
    likes = await increment_likes(db, material_id)
    
    if likes is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    
    return LikeResponse(likes=likes)
