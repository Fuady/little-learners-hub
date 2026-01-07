"""
Mock database for the KidLearn API
This will be replaced with a real database later
"""

from datetime import datetime
from typing import Optional
from passlib.context import CryptContext

from .models import User, UserInDB, Material, MaterialType, GradeLevel, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Mock Users Database
users_db: dict[str, UserInDB] = {
    "1": UserInDB(
        id="1",
        email="parent@example.com",
        name="Sarah Johnson",
        role=UserRole.parent,
        avatar="👩‍👧",
        created_at=datetime(2024, 1, 15),
        hashed_password=get_password_hash("password123"),
    ),
    "2": UserInDB(
        id="2",
        email="teacher@example.com",
        name="Mr. Thompson",
        role=UserRole.educator,
        avatar="👨‍🏫",
        created_at=datetime(2024, 1, 10),
        hashed_password=get_password_hash("password123"),
    ),
}

# Email to ID mapping for quick lookup
email_to_id: dict[str, str] = {
    "parent@example.com": "1",
    "teacher@example.com": "2",
}


# Mock Materials Database
materials_db: dict[str, Material] = {
    "1": Material(
        id="1",
        title="ABC Tracing Fun",
        description="Learn to trace letters A-Z with colorful guides and fun characters!",
        type=MaterialType.worksheet,
        grade_level=GradeLevel.kindergarten,
        thumbnail="📝",
        download_url="/materials/abc-tracing.pdf",
        is_interactive=False,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 6, 1),
        downloads=1250,
        likes=89,
        tags=["alphabet", "writing", "tracing"],
    ),
    "2": Material(
        id="2",
        title="Number Puzzle Adventure",
        description="Solve puzzles while learning numbers 1-100!",
        type=MaterialType.puzzle,
        grade_level=GradeLevel.grade1,
        thumbnail="🧩",
        is_interactive=True,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 28),
        downloads=890,
        likes=156,
        tags=["numbers", "math", "puzzle"],
    ),
    "3": Material(
        id="3",
        title="Animal Coloring Book",
        description="Color beautiful animals from around the world!",
        type=MaterialType.drawing,
        grade_level=GradeLevel.kindergarten,
        thumbnail="🎨",
        download_url="/materials/animals-coloring.pdf",
        is_interactive=False,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 25),
        downloads=2100,
        likes=234,
        tags=["animals", "coloring", "art"],
    ),
    "4": Material(
        id="4",
        title="Math Monsters Game",
        description="Battle friendly monsters with your math skills!",
        type=MaterialType.game,
        grade_level=GradeLevel.grade2,
        thumbnail="👾",
        is_interactive=True,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 20),
        downloads=3500,
        likes=567,
        tags=["math", "addition", "subtraction", "game"],
    ),
    "5": Material(
        id="5",
        title="Science Activity Book",
        description="Explore the wonders of science with hands-on activities!",
        type=MaterialType.activity_book,
        grade_level=GradeLevel.grade3,
        thumbnail="🔬",
        download_url="/materials/science-activities.pdf",
        is_interactive=False,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 15),
        downloads=780,
        likes=123,
        tags=["science", "experiments", "activities"],
    ),
    "6": Material(
        id="6",
        title="Reading Comprehension Stories",
        description="Fun stories with questions to boost reading skills!",
        type=MaterialType.worksheet,
        grade_level=GradeLevel.grade4,
        thumbnail="📚",
        download_url="/materials/reading-stories.pdf",
        is_interactive=False,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 10),
        downloads=920,
        likes=178,
        tags=["reading", "comprehension", "stories"],
    ),
    "7": Material(
        id="7",
        title="Fraction Pizza Party",
        description="Learn fractions by making virtual pizzas!",
        type=MaterialType.game,
        grade_level=GradeLevel.grade5,
        thumbnail="🍕",
        is_interactive=True,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 5),
        downloads=1450,
        likes=289,
        tags=["fractions", "math", "game"],
    ),
    "8": Material(
        id="8",
        title="Shape Explorer Puzzle",
        description="Match and learn geometric shapes through puzzles!",
        type=MaterialType.puzzle,
        grade_level=GradeLevel.grade1,
        thumbnail="🔷",
        is_interactive=True,
        author_id="2",
        author_name="Mr. Thompson",
        created_at=datetime(2024, 5, 1),
        downloads=670,
        likes=98,
        tags=["shapes", "geometry", "puzzle"],
    ),
}


# Database operations
def get_user_by_email(email: str) -> Optional[UserInDB]:
    user_id = email_to_id.get(email)
    if user_id:
        return users_db.get(user_id)
    return None


def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    return users_db.get(user_id)


def create_user(email: str, password: str, name: str, role: UserRole) -> User:
    user_id = str(len(users_db) + 1)
    hashed_password = get_password_hash(password)
    
    user_in_db = UserInDB(
        id=user_id,
        email=email,
        name=name,
        role=role,
        avatar="👨‍👩‍👧" if role == UserRole.parent else "👨‍🏫",
        created_at=datetime.now(),
        hashed_password=hashed_password,
    )
    
    users_db[user_id] = user_in_db
    email_to_id[email] = user_id
    
    return User(
        id=user_in_db.id,
        email=user_in_db.email,
        name=user_in_db.name,
        role=user_in_db.role,
        avatar=user_in_db.avatar,
        created_at=user_in_db.created_at,
    )


def get_materials(
    material_type: Optional[MaterialType] = None,
    grade_level: Optional[GradeLevel] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Material], int]:
    materials = list(materials_db.values())
    
    if material_type:
        materials = [m for m in materials if m.type == material_type]
    
    if grade_level:
        materials = [m for m in materials if m.grade_level == grade_level]
    
    if search:
        search_lower = search.lower()
        materials = [
            m for m in materials
            if search_lower in m.title.lower()
            or search_lower in m.description.lower()
            or any(search_lower in tag.lower() for tag in m.tags)
        ]
    
    total = len(materials)
    materials = materials[offset:offset + limit]
    
    return materials, total


def get_material_by_id(material_id: str) -> Optional[Material]:
    return materials_db.get(material_id)


def create_material(
    author_id: str,
    author_name: str,
    title: str,
    description: str,
    material_type: MaterialType,
    grade_level: GradeLevel,
    is_interactive: bool,
    tags: list[str],
) -> Material:
    material_id = str(len(materials_db) + 1)
    
    type_emojis = {
        MaterialType.worksheet: "📝",
        MaterialType.activity_book: "📖",
        MaterialType.drawing: "🎨",
        MaterialType.puzzle: "🧩",
        MaterialType.game: "🎮",
    }
    
    material = Material(
        id=material_id,
        title=title,
        description=description,
        type=material_type,
        grade_level=grade_level,
        thumbnail=type_emojis.get(material_type, "📄"),
        is_interactive=is_interactive,
        author_id=author_id,
        author_name=author_name,
        created_at=datetime.now(),
        downloads=0,
        likes=0,
        tags=tags,
    )
    
    materials_db[material_id] = material
    return material


def increment_downloads(material_id: str) -> Optional[int]:
    material = materials_db.get(material_id)
    if material:
        # Create a new material with incremented downloads
        updated = Material(
            **{**material.model_dump(), "downloads": material.downloads + 1}
        )
        materials_db[material_id] = updated
        return updated.downloads
    return None


def increment_likes(material_id: str) -> Optional[int]:
    material = materials_db.get(material_id)
    if material:
        # Create a new material with incremented likes
        updated = Material(
            **{**material.model_dump(), "likes": material.likes + 1}
        )
        materials_db[material_id] = updated
        return updated.likes
    return None


def get_stats() -> dict:
    materials = list(materials_db.values())
    
    grade_breakdown: dict[str, int] = {}
    total_downloads = 0
    
    for material in materials:
        grade_breakdown[material.grade_level.value] = (
            grade_breakdown.get(material.grade_level.value, 0) + 1
        )
        total_downloads += material.downloads
    
    return {
        "total_materials": len(materials),
        "total_downloads": total_downloads,
        "total_users": len(users_db),
        "grade_breakdown": grade_breakdown,
    }
