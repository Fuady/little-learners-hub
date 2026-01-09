import asyncio
import os
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Import from our application
# We need to make sure 'backend' is in path if running as script
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.db import DATABASE_URL, Base
from backend.db_models import User, Material
from backend.models import UserRole, MaterialType, GradeLevel
from backend.database import get_password_hash

# Create a dedicated engine for seeding
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def seed_data():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # check if data exists
        result = await session.execute(select(User))
        user = result.scalars().first()
        if user:
            print("Database already seeded.")
            return

        print("Seeding database...")
        
        # Create Users
        users = [
            User(
                id="1",
                email="parent@example.com",
                name="Sarah Johnson",
                role=UserRole.parent.value,
                avatar="👩‍👧",
                hashed_password=get_password_hash("password123"),
                created_at=datetime(2024, 1, 15),
            ),
            User(
                id="2",
                email="teacher@example.com",
                name="Mr. Thompson",
                role=UserRole.educator.value,
                avatar="👨‍🏫",
                hashed_password=get_password_hash("password123"),
                created_at=datetime(2024, 1, 10),
            )
        ]
        
        session.add_all(users)
        
        # Create Materials
        materials = [
            Material(
                id="1",
                title="ABC Tracing Fun",
                description="Learn to trace letters A-Z with colorful guides and fun characters!",
                type=MaterialType.worksheet.value,
                grade_level=GradeLevel.kindergarten.value,
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
            Material(
                id="2",
                title="Number Puzzle Adventure",
                description="Solve puzzles while learning numbers 1-100!",
                type=MaterialType.puzzle.value,
                grade_level=GradeLevel.grade1.value,
                thumbnail="🧩",
                is_interactive=True,
                author_id="2",
                author_name="Mr. Thompson",
                created_at=datetime(2024, 5, 28),
                downloads=890,
                likes=156,
                tags=["numbers", "math", "puzzle"],
            ),
            Material(
                id="3",
                title="Animal Coloring Book",
                description="Color beautiful animals from around the world!",
                type=MaterialType.drawing.value,
                grade_level=GradeLevel.kindergarten.value,
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
            Material(
                id="4",
                title="Math Monsters Game",
                description="Battle friendly monsters with your math skills!",
                type=MaterialType.game.value,
                grade_level=GradeLevel.grade2.value,
                thumbnail="👾",
                is_interactive=True,
                author_id="2",
                author_name="Mr. Thompson",
                created_at=datetime(2024, 5, 20),
                downloads=3500,
                likes=567,
                tags=["math", "addition", "subtraction", "game"],
            ),
            Material(
                id="5",
                title="Science Activity Book",
                description="Explore the wonders of science with hands-on activities!",
                type=MaterialType.activity_book.value,
                grade_level=GradeLevel.grade3.value,
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
            Material(
                id="6",
                title="Reading Comprehension Stories",
                description="Fun stories with questions to boost reading skills!",
                type=MaterialType.worksheet.value,
                grade_level=GradeLevel.grade4.value,
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
            Material(
                id="7",
                title="Fraction Pizza Party",
                description="Learn fractions by making virtual pizzas!",
                type=MaterialType.game.value,
                grade_level=GradeLevel.grade5.value,
                thumbnail="🍕",
                is_interactive=True,
                author_id="2",
                author_name="Mr. Thompson",
                created_at=datetime(2024, 5, 5),
                downloads=1450,
                likes=289,
                tags=["fractions", "math", "game"],
            ),
            Material(
                id="8",
                title="Shape Explorer Puzzle",
                description="Match and learn geometric shapes through puzzles!",
                type=MaterialType.puzzle.value,
                grade_level=GradeLevel.grade1.value,
                thumbnail="🔷",
                is_interactive=True,
                author_id="2",
                author_name="Mr. Thompson",
                created_at=datetime(2024, 5, 1),
                downloads=670,
                likes=98,
                tags=["shapes", "geometry", "puzzle"],
            ),
        ]
        
        session.add_all(materials)
        await session.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(seed_data())
