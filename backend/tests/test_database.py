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


class TestPasswordOperations:
    """Test password hashing and verification"""

    def test_password_hash_creates_different_hashes(self):
        """Same password should create different hashes"""
        hash1 = get_password_hash("testpassword")
        hash2 = get_password_hash("testpassword")
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Correct password should verify successfully"""
        password = "mypassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Incorrect password should fail verification"""
        password = "mypassword123"
        hashed = get_password_hash(password)
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_case_sensitive(self):
        """Password verification should be case sensitive"""
        password = "MyPassword123"
        hashed = get_password_hash(password)
        assert verify_password("mypassword123", hashed) is False


class TestUserOperations:
    """Test user database operations"""

    def test_get_user_by_email_existing(self):
        """Should retrieve existing user by email"""
        user = get_user_by_email("parent@example.com")
        assert user is not None
        assert user.email == "parent@example.com"
        assert user.name == "Sarah Johnson"

    def test_get_user_by_email_nonexistent(self):
        """Should return None for non-existent email"""
        user = get_user_by_email("nonexistent@example.com")
        assert user is None

    def test_get_user_by_id_existing(self):
        """Should retrieve existing user by ID"""
        user = get_user_by_id("1")
        assert user is not None
        assert user.id == "1"
        assert user.email == "parent@example.com"

    def test_get_user_by_id_nonexistent(self):
        """Should return None for non-existent ID"""
        user = get_user_by_id("999")
        assert user is None

    def test_create_user_parent(self, reset_test_users):
        """Should create new parent user"""
        user = create_user(
            email="newparent@test.com",
            password="testpass123",
            name="New Parent",
            role=UserRole.parent,
        )
        assert user.email == "newparent@test.com"
        assert user.name == "New Parent"
        assert user.role == UserRole.parent
        assert user.avatar == "👨‍👩‍👧"
        assert user.id is not None

    def test_create_user_educator(self, reset_test_users):
        """Should create new educator user"""
        user = create_user(
            email="neweducator@test.com",
            password="testpass123",
            name="New Educator",
            role=UserRole.educator,
        )
        assert user.email == "neweducator@test.com"
        assert user.role == UserRole.educator
        assert user.avatar == "👨‍🏫"

    def test_create_user_password_hashed(self, reset_test_users):
        """Created user should have hashed password"""
        user = create_user(
            email="hashtest@test.com",
            password="plainpassword",
            name="Hash Test",
            role=UserRole.parent,
        )
        # Retrieve from database
        user_in_db = get_user_by_email("hashtest@test.com")
        assert user_in_db.hashed_password != "plainpassword"
        assert verify_password("plainpassword", user_in_db.hashed_password)


class TestMaterialOperations:
    """Test material database operations"""

    def test_get_materials_all(self):
        """Should retrieve all materials"""
        materials, total = get_materials()
        assert len(materials) > 0
        assert total > 0
        assert len(materials) == total

    def test_get_materials_filter_by_type(self):
        """Should filter materials by type"""
        materials, total = get_materials(material_type=MaterialType.game)
        assert all(m.type == MaterialType.game for m in materials)
        assert total == len(materials)

    def test_get_materials_filter_by_grade(self):
        """Should filter materials by grade level"""
        materials, total = get_materials(grade_level=GradeLevel.kindergarten)
        assert all(m.grade_level == GradeLevel.kindergarten for m in materials)

    def test_get_materials_search_title(self):
        """Should search materials by title"""
        materials, total = get_materials(search="ABC")
        assert len(materials) > 0
        assert any("ABC" in m.title for m in materials)

    def test_get_materials_search_description(self):
        """Should search materials by description"""
        materials, total = get_materials(search="math")
        assert len(materials) > 0

    def test_get_materials_search_tags(self):
        """Should search materials by tags"""
        materials, total = get_materials(search="alphabet")
        assert len(materials) > 0
        assert any("alphabet" in m.tags for m in materials)

    def test_get_materials_search_case_insensitive(self):
        """Search should be case insensitive"""
        materials_lower, _ = get_materials(search="math")
        materials_upper, _ = get_materials(search="MATH")
        materials_mixed, _ = get_materials(search="MaTh")
        assert len(materials_lower) == len(materials_upper) == len(materials_mixed)

    def test_get_materials_combined_filters(self):
        """Should apply multiple filters together"""
        materials, total = get_materials(
            material_type=MaterialType.game,
            grade_level=GradeLevel.grade2,
        )
        assert all(
            m.type == MaterialType.game and m.grade_level == GradeLevel.grade2
            for m in materials
        )

    def test_get_materials_pagination(self):
        """Should paginate results correctly"""
        # Get first page
        page1, total = get_materials(limit=2, offset=0)
        assert len(page1) == 2
        
        # Get second page
        page2, _ = get_materials(limit=2, offset=2)
        assert len(page2) <= 2
        
        # Pages should have different materials
        assert page1[0].id != page2[0].id

    def test_get_materials_offset_beyond_total(self):
        """Should return empty list when offset exceeds total"""
        materials, total = get_materials(offset=1000)
        assert len(materials) == 0
        assert total > 0  # Total should still reflect actual count

    def test_get_materials_no_results(self):
        """Should return empty list when no matches"""
        materials, total = get_materials(search="nonexistentmaterial12345")
        assert len(materials) == 0
        assert total == 0

    def test_get_material_by_id_existing(self):
        """Should retrieve material by ID"""
        material = get_material_by_id("1")
        assert material is not None
        assert material.id == "1"
        assert material.title == "ABC Tracing Fun"

    def test_get_material_by_id_nonexistent(self):
        """Should return None for non-existent ID"""
        material = get_material_by_id("999")
        assert material is None

    def test_create_material(self, reset_test_materials):
        """Should create new material"""
        material = create_material(
            author_id="2",
            author_name="Test Author",
            title="New Test Material",
            description="This is a new test material",
            material_type=MaterialType.worksheet,
            grade_level=GradeLevel.grade3,
            is_interactive=False,
            tags=["test", "new"],
        )
        assert material.title == "New Test Material"
        assert material.type == MaterialType.worksheet
        assert material.grade_level == GradeLevel.grade3
        assert material.downloads == 0
        assert material.likes == 0
        assert material.thumbnail == "📝"

    def test_create_material_assigns_id(self, reset_test_materials):
        """Created material should have unique ID"""
        material = create_material(
            author_id="2",
            author_name="Test",
            title="ID Test",
            description="Testing ID assignment",
            material_type=MaterialType.game,
            grade_level=GradeLevel.grade1,
            is_interactive=True,
            tags=["test"],
        )
        assert material.id is not None
        assert get_material_by_id(material.id) is not None

    def test_increment_downloads(self):
        """Should increment download count"""
        original = get_material_by_id("1")
        original_count = original.downloads
        
        new_count = increment_downloads("1")
        assert new_count == original_count + 1
        
        updated = get_material_by_id("1")
        assert updated.downloads == original_count + 1

    def test_increment_downloads_nonexistent(self):
        """Should return None for non-existent material"""
        result = increment_downloads("999")
        assert result is None

    def test_increment_likes(self):
        """Should increment like count"""
        original = get_material_by_id("1")
        original_count = original.likes
        
        new_count = increment_likes("1")
        assert new_count == original_count + 1
        
        updated = get_material_by_id("1")
        assert updated.likes == original_count + 1

    def test_increment_likes_nonexistent(self):
        """Should return None for non-existent material"""
        result = increment_likes("999")
        assert result is None


class TestStatsOperations:
    """Test statistics operations"""

    def test_get_stats_structure(self):
        """Stats should have correct structure"""
        stats = get_stats()
        assert "total_materials" in stats
        assert "total_downloads" in stats
        assert "total_users" in stats
        assert "grade_breakdown" in stats

    def test_get_stats_total_materials(self):
        """Should count total materials correctly"""
        stats = get_stats()
        materials, _ = get_materials()
        assert stats["total_materials"] == len(materials)

    def test_get_stats_total_users(self):
        """Should count total users correctly"""
        stats = get_stats()
        assert stats["total_users"] >= 2  # At least the default users

    def test_get_stats_grade_breakdown(self):
        """Should provide grade breakdown"""
        stats = get_stats()
        breakdown = stats["grade_breakdown"]
        assert isinstance(breakdown, dict)
        assert len(breakdown) > 0
        
        # All values should be positive integers
        for grade, count in breakdown.items():
            assert isinstance(count, int)
            assert count > 0

    def test_get_stats_total_downloads(self):
        """Should sum all downloads correctly"""
        stats = get_stats()
        materials, _ = get_materials()
        expected_downloads = sum(m.downloads for m in materials)
        assert stats["total_downloads"] == expected_downloads
