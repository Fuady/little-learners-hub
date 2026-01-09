from datetime import datetime
from typing import Optional, List, Tuple

from sqlalchemy import select, func, or_, String
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from .models import UserRole, MaterialType, GradeLevel, User as UserSchema, Material as MaterialSchema, UserInDB
from .db_models import User, Material

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Database operations

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    return await db.get(User, user_id)


async def create_user(
    db: AsyncSession, email: str, password: str, name: str, role: UserRole
) -> User:
    # Generate ID (UUID would be better, but staying simple for now or letting DB handle if auto-increment, 
    # but our model defined String ID. I'll generate a UUID here or simple generic ID if seeding)
    import uuid
    user_id = str(uuid.uuid4())
    
    hashed_password = get_password_hash(password)
    
    db_user = User(
        id=user_id,
        email=email,
        name=name,
        role=role.value,
        avatar="👨‍👩‍👧" if role == UserRole.parent else "👨‍🏫",
        hashed_password=hashed_password,
        created_at=datetime.utcnow(),
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_materials(
    db: AsyncSession,
    material_type: Optional[MaterialType] = None,
    grade_level: Optional[GradeLevel] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[List[Material], int]:
    query = select(Material)
    
    if material_type:
        query = query.where(Material.type == material_type.value)
    
    if grade_level:
        query = query.where(Material.grade_level == grade_level.value)
    
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Material.title).like(search_lower),
                func.lower(Material.description).like(search_lower),
                # Search in tags needs JSON logic depending on DB (Postgres vs SQLite)
                # For compatibility/simplicity, we might skip tag search in SQL or use naive string match if stored as JSON/String
                # SQLite JSON functions vs Postgres API.
                # Assuming simple string matching for now or robust logic?
                # Let's try to match serialized JSON text for simplicity across DBs:
                func.cast(Material.tags, String).like(search_lower) 
            )
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0
    
    # Paginate
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    materials = result.scalars().all()
    
    return list(materials), total


async def get_material_by_id(db: AsyncSession, material_id: str) -> Optional[Material]:
    return await db.get(Material, material_id)


async def create_material(
    db: AsyncSession,
    author_id: str,
    author_name: str,
    title: str,
    description: str,
    material_type: MaterialType,
    grade_level: GradeLevel,
    is_interactive: bool,
    tags: List[str],
    download_url: Optional[str] = None,
) -> Material:
    import uuid
    material_id = str(uuid.uuid4())
    
    type_emojis = {
        MaterialType.worksheet: "📝",
        MaterialType.activity_book: "📖",
        MaterialType.drawing: "🎨",
        MaterialType.puzzle: "🧩",
        MaterialType.game: "🎮",
    }
    
    db_material = Material(
        id=material_id,
        title=title,
        description=description,
        type=material_type.value,
        grade_level=grade_level.value,
        thumbnail=type_emojis.get(material_type, "📄"),
        download_url=download_url,
        is_interactive=is_interactive,
        author_id=author_id,
        author_name=author_name,
        created_at=datetime.utcnow(),
        downloads=0,
        likes=0,
        tags=tags,
    )
    
    db.add(db_material)
    await db.commit()
    await db.refresh(db_material)
    return db_material


async def increment_downloads(db: AsyncSession, material_id: str) -> Optional[int]:
    material = await db.get(Material, material_id)
    if material:
        material.downloads += 1
        await db.commit()
        await db.refresh(material)
        return material.downloads
    return None


async def increment_likes(db: AsyncSession, material_id: str) -> Optional[int]:
    material = await db.get(Material, material_id)
    if material:
        material.likes += 1
        await db.commit()
        await db.refresh(material)
        return material.likes
    return None


async def get_stats(db: AsyncSession) -> dict:
    # Total materials
    total_materials = await db.scalar(select(func.count(Material.id))) or 0
    
    # Total downloads
    total_downloads = await db.scalar(select(func.sum(Material.downloads))) or 0
    
    # Total users
    total_users = await db.scalar(select(func.count(User.id))) or 0
    
    # Grade breakdown
    grade_counts = await db.execute(
        select(Material.grade_level, func.count(Material.id))
        .group_by(Material.grade_level)
    )
    grade_breakdown = {row[0]: row[1] for row in grade_counts}
    
    return {
        "total_materials": total_materials,
        "total_downloads": total_downloads,
        "total_users": total_users,
        "grade_breakdown": grade_breakdown,
    }
