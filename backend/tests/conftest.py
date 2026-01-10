"""
Pytest configuration and shared fixtures for backend tests
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.db import get_db, Base
from backend.db_models import User, Material # Ensure models are imported for metadata
from backend.models import UserRole

import os
# Use in-memory SQLite for tests by default, allow override via env
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create a fresh database engine for each test"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    """Create a fresh database session for each test"""
    TestingSessionLocal = async_sessionmaker(
        bind=db_engine,
        autoflush=False,
        expire_on_commit=False,
        class_=AsyncSession,
    )
    
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Async API client with DB override"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    # Use AsyncClient for async endpoints
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def parent_token(client):
    """Get authentication token for parent user"""
    # Create user first since DB is empty
    # We can use the API or direct DB manipulation. API is cleaner if we assume register works.
    # But register requires auth? No.
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "parent@example.com",
            "password": "password123",
            "name": "Sarah Johnson",
            "role": "parent"
        },
    )
    if response.status_code != 201:
         # If already exists (e.g. from previous test in same session issue?), try login
         response = await client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
    return response.json()["access_token"]


@pytest.fixture
async def educator_token(client):
    """Get authentication token for educator user"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "teacher@example.com",
            "password": "password123",
            "name": "Mr. Thompson",
            "role": "educator"
        },
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
async def seeded_materials(client, educator_headers):
    """Seed some materials for testing"""
    materials = []
    
    # Material 1
    resp1 = await client.post(
        "/api/v1/materials",
        headers=educator_headers,
        json={
            "title": "Test Worksheet",
            "description": "Description 1",
            "type": "worksheet",
            "grade_level": "grade2",
            "is_interactive": False,
            "tags": ["tag1"]
        }
    )
    materials.append(resp1.json())
    
    # Material 2
    resp2 = await client.post(
        "/api/v1/materials",
        headers=educator_headers,
        json={
            "title": "Numbers Game",
            "description": "Description 2",
            "type": "game",
            "grade_level": "kindergarten",
            "is_interactive": True,
            "tags": ["tag2"]
        }
    )
    materials.append(resp2.json())
    
    return materials


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
