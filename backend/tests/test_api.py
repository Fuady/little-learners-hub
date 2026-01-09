"""
API Tests for KidLearn Backend
"""

import pytest
from backend.main import app

# Mark all tests in module as async
pytestmark = pytest.mark.asyncio


class TestHealthEndpoints:
    """Test health and root endpoints"""

    async def test_root(self, client):
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "KidLearn API"
        assert data["status"] == "running"

    async def test_health(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestAuthEndpoints:
    """Test authentication endpoints"""

    async def test_login_success(self, client, parent_token):
        # parent_token fixture ensures user is registered. 
        # But we want to test explicit login here.
        # User is "parent@example.com" / "password123" from fixture setup
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "parent@example.com"
        assert data["user"]["role"] == "parent"

    async def test_login_invalid_credentials(self, client):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    async def test_register_success(self, client):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newunique@test.com",
                "password": "testpassword123",
                "name": "New User",
                "role": "parent",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["name"] == "New User"

    async def test_register_duplicate_email(self, client):
        # First registration
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@test.com",
                "password": "testpassword123",
                "name": "User One",
                "role": "parent",
            },
        )
        # Second registration with same email
        response = await client.post(
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

    async def test_list_materials(self, client, seeded_materials):
        response = await client.get("/api/v1/materials")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1

    async def test_list_materials_with_type_filter(self, client, seeded_materials):
        # seeded_materials creates a 'worksheet'
        response = await client.get("/api/v1/materials?type=worksheet")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["type"] == "worksheet"

    async def test_list_materials_with_grade_filter(self, client, seeded_materials):
        # seeded_materials creates a 'kindergarten' material
        response = await client.get("/api/v1/materials?gradeLevel=kindergarten")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["grade_level"] == "kindergarten"

    async def test_list_materials_with_search(self, client, seeded_materials):
        response = await client.get("/api/v1/materials?search=Test")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1

    async def test_get_material_by_id(self, client, seeded_materials):
        material_id = seeded_materials[0]["id"]
        response = await client.get(f"/api/v1/materials/{material_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == material_id
        assert "title" in data

    async def test_get_material_not_found(self, client):
        response = await client.get("/api/v1/materials/nonexistent-id-999")
        assert response.status_code == 404

    async def test_download_material(self, client, seeded_materials):
        material_id = seeded_materials[0]["id"]
        response = await client.post(f"/api/v1/materials/{material_id}/download")
        assert response.status_code == 200
        data = response.json()
        assert "url" in data

    async def test_like_material_with_auth(self, client, seeded_materials, parent_token):
        material_id = seeded_materials[0]["id"]
        response = await client.post(
            f"/api/v1/materials/{material_id}/like",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "likes" in data

    async def test_submit_material_as_educator(self, client, educator_token):
        response = await client.post(
            "/api/v1/materials",
            json={
                "title": "New Test Material",
                "description": "This is a test material description",
                "type": "worksheet",
                "grade_level": "grade2",
                "is_interactive": False,
                "tags": ["test", "example"],
            },
            headers={"Authorization": f"Bearer {educator_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Test Material"

    async def test_submit_material_as_parent_fails(self, client, parent_token):
        response = await client.post(
            "/api/v1/materials",
            json={
                "title": "Test Material",
                "description": "This is a test material description",
                "type": "worksheet",
                "grade_level": "grade2",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert response.status_code == 403


class TestStatsEndpoints:
    """Test stats endpoints"""

    async def test_get_stats(self, client, seeded_materials):
        response = await client.get("/api/v1/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_materials" in data
        assert "total_downloads" in data
        assert "total_users" in data
        assert "grade_breakdown" in data


class TestUsersEndpoints:
    """Test users endpoints"""

    async def test_get_current_user_with_auth(self, client, parent_token):
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "parent@example.com"
