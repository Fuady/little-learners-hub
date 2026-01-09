"""
Pytest configuration and shared fixtures for backend tests
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend import database


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def parent_token(client):
    """Get authentication token for parent user"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "parent@example.com", "password": "password123"},
    )
    return response.json()["access_token"]


@pytest.fixture
def educator_token(client):
    """Get authentication token for educator user"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@example.com", "password": "password123"},
    )
    return response.json()["access_token"]


@pytest.fixture
def parent_headers(parent_token):
    """Authorization headers for parent user"""
    return {"Authorization": f"Bearer {parent_token}"}


@pytest.fixture
def educator_headers(educator_token):
    """Authorization headers for educator user"""
    return {"Authorization": f"Bearer {educator_token}"}


@pytest.fixture
def sample_material_data():
    """Sample material data for testing"""
    return {
        "title": "Test Material",
        "description": "This is a test material for automated testing purposes",
        "type": "worksheet",
        "grade_level": "grade2",
        "is_interactive": False,
        "tags": ["test", "automation", "sample"],
    }


@pytest.fixture
def reset_test_users():
    """Reset users database to initial state after test"""
    # Store original state
    original_users = database.users_db.copy()
    original_email_map = database.email_to_id.copy()
    
    yield
    
    # Restore original state
    database.users_db.clear()
    database.users_db.update(original_users)
    database.email_to_id.clear()
    database.email_to_id.update(original_email_map)


@pytest.fixture
def reset_test_materials():
    """Reset materials database to initial state after test"""
    # Store original state
    original_materials = database.materials_db.copy()
    
    yield
    
    # Restore original state
    database.materials_db.clear()
    database.materials_db.update(original_materials)
