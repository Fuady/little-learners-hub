"""
API Tests for KidLearn Backend
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health and root endpoints"""

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "KidLearn API"
        assert data["status"] == "running"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_login_success(self):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "parent@example.com"
        assert data["user"]["role"] == "parent"

    def test_login_invalid_credentials(self):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_register_success(self):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "testpassword123",
                "name": "New User",
                "role": "parent",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["name"] == "New User"

    def test_register_duplicate_email(self):
        # First registration
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@test.com",
                "password": "testpassword123",
                "name": "User One",
                "role": "parent",
            },
        )
        # Second registration with same email
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@test.com",
                "password": "testpassword123",
                "name": "User Two",
                "role": "parent",
            },
        )
        assert response.status_code == 400


class TestMaterialsEndpoints:
    """Test materials endpoints"""

    def test_list_materials(self):
        response = client.get("/api/v1/materials")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) > 0

    def test_list_materials_with_type_filter(self):
        response = client.get("/api/v1/materials?type=game")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["type"] == "game"

    def test_list_materials_with_grade_filter(self):
        response = client.get("/api/v1/materials?gradeLevel=grade1")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["grade_level"] == "grade1"

    def test_list_materials_with_search(self):
        response = client.get("/api/v1/materials?search=math")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0

    def test_get_material_by_id(self):
        response = client.get("/api/v1/materials/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "1"
        assert "title" in data

    def test_get_material_not_found(self):
        response = client.get("/api/v1/materials/invalid-id")
        assert response.status_code == 404

    def test_download_material(self):
        response = client.post("/api/v1/materials/1/download")
        assert response.status_code == 200
        data = response.json()
        assert "url" in data

    def test_download_material_not_found(self):
        response = client.post("/api/v1/materials/invalid-id/download")
        assert response.status_code == 404

    def test_like_material_requires_auth(self):
        response = client.post("/api/v1/materials/1/like")
        assert response.status_code == 403  # No auth header

    def test_like_material_with_auth(self):
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Like material
        response = client.post(
            "/api/v1/materials/1/like",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "likes" in data

    def test_submit_material_as_educator(self):
        # Login as educator
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Submit material
        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Test Material",
                "description": "This is a test material description",
                "type": "worksheet",
                "grade_level": "grade2",
                "is_interactive": False,
                "tags": ["test", "example"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Material"

    def test_submit_material_as_parent_fails(self):
        # Login as parent
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Try to submit material
        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Test Material",
                "description": "This is a test material description",
                "type": "worksheet",
                "grade_level": "grade2",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403


class TestStatsEndpoints:
    """Test stats endpoints"""

    def test_get_stats(self):
        response = client.get("/api/v1/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_materials" in data
        assert "total_downloads" in data
        assert "total_users" in data
        assert "grade_breakdown" in data


class TestUsersEndpoints:
    """Test users endpoints"""

    def test_get_current_user_requires_auth(self):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 403

    def test_get_current_user_with_auth(self):
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Get current user
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "parent@example.com"


class TestAuthValidation:
    """Test authentication validation and edge cases"""

    def test_register_invalid_email(self):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "password123",
                "name": "Test User",
                "role": "parent",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_register_short_password(self):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "short",
                "name": "Test User",
                "role": "parent",
            },
        )
        assert response.status_code == 422  # Password too short

    def test_register_invalid_role(self):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User",
                "role": "invalid_role",
            },
        )
        assert response.status_code == 422

    def test_register_missing_fields(self):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 422

    def test_login_invalid_email_format(self):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email", "password": "password123"},
        )
        assert response.status_code == 422

    def test_logout_requires_auth(self):
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == 403

    def test_logout_with_auth(self):
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_invalid_token_format(self):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid-token-format"},
        )
        assert response.status_code == 401

    def test_malformed_auth_header(self):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "NotBearer token"},
        )
        assert response.status_code == 403


class TestMaterialsValidation:
    """Test materials validation and edge cases"""

    def test_create_material_title_too_short(self):
        # Login as educator
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/v1/materials",
            json={
                "title": "AB",  # Too short (min 3)
                "description": "Valid description here",
                "type": "worksheet",
                "grade_level": "grade1",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_create_material_description_too_short(self):
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Valid Title",
                "description": "Short",  # Too short (min 10)
                "type": "worksheet",
                "grade_level": "grade1",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_create_material_invalid_type(self):
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Valid Title",
                "description": "Valid description here",
                "type": "invalid_type",
                "grade_level": "grade1",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_create_material_invalid_grade_level(self):
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Valid Title",
                "description": "Valid description here",
                "type": "worksheet",
                "grade_level": "grade99",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_create_material_missing_required_fields(self):
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/v1/materials",
            json={
                "title": "Valid Title",
                # Missing description and other required fields
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422


class TestPagination:
    """Test pagination edge cases"""

    def test_pagination_first_page(self):
        response = client.get("/api/v1/materials?limit=3&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 3

    def test_pagination_second_page(self):
        response = client.get("/api/v1/materials?limit=3&offset=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 3

    def test_pagination_limit_boundary(self):
        # Test minimum limit
        response = client.get("/api/v1/materials?limit=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 1

    def test_pagination_max_limit(self):
        # Test maximum limit
        response = client.get("/api/v1/materials?limit=100")
        assert response.status_code == 200

    def test_pagination_limit_exceeds_max(self):
        # Limit above 100 should fail validation
        response = client.get("/api/v1/materials?limit=101")
        assert response.status_code == 422

    def test_pagination_negative_limit(self):
        response = client.get("/api/v1/materials?limit=-1")
        assert response.status_code == 422

    def test_pagination_negative_offset(self):
        response = client.get("/api/v1/materials?offset=-1")
        assert response.status_code == 422

    def test_pagination_offset_beyond_total(self):
        response = client.get("/api/v1/materials?offset=1000")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["total"] > 0  # Total should still be accurate

    def test_pagination_total_count_consistent(self):
        # Total should be same regardless of pagination
        response1 = client.get("/api/v1/materials?limit=2&offset=0")
        response2 = client.get("/api/v1/materials?limit=5&offset=3")
        
        assert response1.json()["total"] == response2.json()["total"]


class TestSearchAndFilters:
    """Test search and filter combinations"""

    def test_combined_filter_type_and_grade(self):
        response = client.get("/api/v1/materials?type=game&gradeLevel=grade2")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["type"] == "game"
            assert item["grade_level"] == "grade2"

    def test_combined_filter_type_and_search(self):
        response = client.get("/api/v1/materials?type=worksheet&search=math")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["type"] == "worksheet"

    def test_combined_all_filters(self):
        response = client.get(
            "/api/v1/materials?type=game&gradeLevel=grade1&search=number"
        )
        assert response.status_code == 200

    def test_search_partial_match(self):
        response = client.get("/api/v1/materials?search=Trac")
        assert response.status_code == 200
        data = response.json()
        # Should find "ABC Tracing Fun"
        assert any("Trac" in item["title"] for item in data["items"])

    def test_search_case_insensitive(self):
        response1 = client.get("/api/v1/materials?search=math")
        response2 = client.get("/api/v1/materials?search=MATH")
        response3 = client.get("/api/v1/materials?search=MaTh")
        
        assert response1.json()["total"] == response2.json()["total"]
        assert response2.json()["total"] == response3.json()["total"]

    def test_search_in_tags(self):
        response = client.get("/api/v1/materials?search=alphabet")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0

    def test_search_no_results(self):
        response = client.get("/api/v1/materials?search=xyznoresults123")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["total"] == 0

    def test_filter_invalid_type(self):
        response = client.get("/api/v1/materials?type=invalid_type")
        assert response.status_code == 422

    def test_filter_invalid_grade(self):
        response = client.get("/api/v1/materials?gradeLevel=invalid_grade")
        assert response.status_code == 422


class TestErrorResponses:
    """Test error response formats and status codes"""

    def test_404_error_format(self):
        response = client.get("/api/v1/materials/nonexistent-id")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

    def test_401_error_format(self):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_403_error_format(self):
        # Try to access protected endpoint without auth
        response = client.post("/api/v1/materials/1/like")
        assert response.status_code == 403

    def test_422_validation_error_format(self):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "invalid-email"},
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


class TestMaterialInteractions:
    """Test material download and like interactions"""

    def test_download_increments_count(self):
        # Get initial count
        material_response = client.get("/api/v1/materials/1")
        initial_downloads = material_response.json()["downloads"]

        # Download
        client.post("/api/v1/materials/1/download")

        # Verify count increased
        updated_response = client.get("/api/v1/materials/1")
        new_downloads = updated_response.json()["downloads"]
        assert new_downloads == initial_downloads + 1

    def test_like_increments_count(self):
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Get initial count
        material_response = client.get("/api/v1/materials/1")
        initial_likes = material_response.json()["likes"]

        # Like
        client.post(
            "/api/v1/materials/1/like",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Verify count increased
        updated_response = client.get("/api/v1/materials/1")
        new_likes = updated_response.json()["likes"]
        assert new_likes == initial_likes + 1

    def test_multiple_downloads_same_material(self):
        # Download multiple times
        client.post("/api/v1/materials/1/download")
        client.post("/api/v1/materials/1/download")
        
        # Both should succeed
        response = client.post("/api/v1/materials/1/download")
        assert response.status_code == 200
