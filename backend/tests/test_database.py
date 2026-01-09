"""
Unit tests for database operations
"""

import pytest
from backend.database import (
    get_user_by_email,
    get_user_by_id,
    create_user,
    verify_password,
    get_password_hash,
    get_materials,
    get_material_by_id,
    create_material,
    increment_downloads,
    increment_likes,
    get_stats,
)
from backend.models import UserRole, MaterialType, GradeLevel

# Mark all tests in this module as async
pytestmark = pytest.mark.asyncio


class TestPasswordOperations:
    """Test password hashing and verification"""
    # These are synchronous utility functions, no DB needed

    async def test_password_hash_creates_different_hashes(self):
        """Same password should create different hashes"""
        hash1 = get_password_hash("testpassword")
        hash2 = get_password_hash("testpassword")
        assert hash1 != hash2

    async def test_verify_password_correct(self):
        """Correct password should verify successfully"""
        password = "mypassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True


class TestUserOperations:
    """Test user database operations"""

    async def test_create_and_get_user(self, db_session):
        """Should create and retrieve user"""
        user = await create_user(
            db_session,
            email="test@example.com",
            password="password",
            name="Test User",
            role=UserRole.parent
        )
        
        fetched = await get_user_by_email(db_session, "test@example.com")
        assert fetched.id == user.id
        assert fetched.name == "Test User"
        
        fetched_id = await get_user_by_id(db_session, user.id)
        assert fetched_id.email == "test@example.com"

    async def test_get_user_by_email_nonexistent(self, db_session):
        """Should return None for non-existent email"""
        user = await get_user_by_email(db_session, "nonexistent@example.com")
        assert user is None


class TestMaterialOperations:
    """Test material database operations"""

    async def test_create_and_get_material(self, db_session):
        """Should create and retrieve material"""
        # Need a user first because of ForeignKey
        user = await create_user(db_session, "auth@test.com", "pass", "Author", UserRole.educator)
        
        material = await create_material(
            db_session,
            author_id=user.id,
            author_name=user.name,
            title="Test Material",
            description="Description",
            material_type=MaterialType.worksheet,
            grade_level=GradeLevel.grade1,
            is_interactive=False,
            tags=["tag1"]
        )
        
        fetched = await get_material_by_id(db_session, material.id)
        assert fetched.title == "Test Material"
        assert fetched.author_id == user.id

    async def test_get_materials_filters(self, db_session):
        """Should filter materials"""
        user = await create_user(db_session, "auth2@test.com", "pass", "Author", UserRole.educator)
        
        await create_material(
            db_session, user.id, user.name, "Math Game", "Desc", 
            MaterialType.game, GradeLevel.grade1, True, ["math"]
        )
        await create_material(
            db_session, user.id, user.name, "Reading Worksheet", "Desc", 
            MaterialType.worksheet, GradeLevel.grade2, False, ["reading"]
        )
        
        # Filter by type
        materials, total = await get_materials(db_session, material_type=MaterialType.game)
        assert len(materials) == 1
        assert materials[0].title == "Math Game"
        
        # Filter by grade
        materials, total = await get_materials(db_session, grade_level=GradeLevel.grade2)
        assert len(materials) == 1
        assert materials[0].title == "Reading Worksheet"

    async def test_increment_downloads(self, db_session):
        """Should increment download count"""
        user = await create_user(db_session, "auth3@test.com", "pass", "Author", UserRole.educator)
        material = await create_material(
            db_session, user.id, user.name, "DL Test", "Desc", 
            MaterialType.worksheet, GradeLevel.grade1, False, []
        )
        
        new_count = await increment_downloads(db_session, material.id)
        assert new_count == 1
        
        fetched = await get_material_by_id(db_session, material.id)
        assert fetched.downloads == 1


class TestStatsOperations:
    """Test stats"""

    async def test_get_stats(self, db_session):
        """Should calculate stats"""
        # Create 2 users
        u1 = await create_user(db_session, "u1@t.com", "p", "U1", UserRole.parent)
        u2 = await create_user(db_session, "u2@t.com", "p", "U2", UserRole.educator)
        
        # Create material with downloads
        m1 = await create_material(
            db_session, u2.id, u2.name, "M1", "D", 
            MaterialType.game, GradeLevel.grade1, False, []
        )
        await increment_downloads(db_session, m1.id)
        await increment_downloads(db_session, m1.id)
        
        stats = await get_stats(db_session)
        
        assert stats["total_users"] == 2
        assert stats["total_materials"] == 1
        assert stats["total_downloads"] == 2
        assert stats["grade_breakdown"]["grade1"] == 1
