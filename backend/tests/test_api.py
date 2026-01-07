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
