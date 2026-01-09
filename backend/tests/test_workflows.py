"""
End-to-end workflow tests for KidLearn API
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class TestUserJourney:
    """Test complete user journey workflows"""

    def test_parent_complete_journey(self):
        """Test parent user: register → login → browse → like → logout"""
        # Step 1: Register
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "journey_parent@test.com",
                "password": "testpass123",
                "name": "Journey Parent",
                "role": "parent",
            },
        )
        assert register_response.status_code == 201
        token = register_response.json()["access_token"]
        user_id = register_response.json()["user"]["id"]

        # Step 2: Browse materials
        materials_response = client.get("/api/v1/materials")
        assert materials_response.status_code == 200
        materials = materials_response.json()["items"]
        assert len(materials) > 0
        first_material_id = materials[0]["id"]

        # Step 3: Like a material
        like_response = client.post(
            f"/api/v1/materials/{first_material_id}/like",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert like_response.status_code == 200
        assert "likes" in like_response.json()

        # Step 4: Get user profile
        profile_response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert profile_response.status_code == 200
        assert profile_response.json()["email"] == "journey_parent@test.com"

        # Step 5: Logout
        logout_response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_response.status_code == 200
        assert logout_response.json()["success"] is True

    def test_educator_complete_journey(self):
        """Test educator: register → login → submit material → verify"""
        # Step 1: Register as educator
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "journey_educator@test.com",
                "password": "testpass123",
                "name": "Journey Educator",
                "role": "educator",
            },
        )
        assert register_response.status_code == 201
        token = register_response.json()["access_token"]

        # Step 2: Submit a material
        submit_response = client.post(
            "/api/v1/materials",
            json={
                "title": "Journey Test Material",
                "description": "This material was created during a test journey",
                "type": "worksheet",
                "grade_level": "grade3",
                "is_interactive": False,
                "tags": ["test", "journey", "automated"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert submit_response.status_code == 201
        material_id = submit_response.json()["id"]

        # Step 3: Verify material exists
        get_response = client.get(f"/api/v1/materials/{material_id}")
        assert get_response.status_code == 200
        material = get_response.json()
        assert material["title"] == "Journey Test Material"
        assert material["author_name"] == "Journey Educator"

        # Step 4: Verify it appears in listings
        list_response = client.get("/api/v1/materials?search=Journey")
        assert list_response.status_code == 200
        found = any(m["id"] == material_id for m in list_response.json()["items"])
        assert found is True


class TestMaterialWorkflow:
    """Test material interaction workflows"""

    def test_material_discovery_and_download(self):
        """Test: search → filter → view → download"""
        # Step 1: Search for materials
        search_response = client.get("/api/v1/materials?search=math")
        assert search_response.status_code == 200
        results = search_response.json()["items"]
        assert len(results) > 0

        # Step 2: Filter by grade
        filter_response = client.get(
            "/api/v1/materials?search=math&gradeLevel=grade2"
        )
        assert filter_response.status_code == 200
        filtered = filter_response.json()["items"]
        
        # All results should be grade2
        for item in filtered:
            assert item["grade_level"] == "grade2"

        # Step 3: View material details
        if len(filtered) > 0:
            material_id = filtered[0]["id"]
            detail_response = client.get(f"/api/v1/materials/{material_id}")
            assert detail_response.status_code == 200
            initial_downloads = detail_response.json()["downloads"]

            # Step 4: Download material
            download_response = client.post(f"/api/v1/materials/{material_id}/download")
            assert download_response.status_code == 200
            assert "url" in download_response.json()

            # Step 5: Verify download count increased
            verify_response = client.get(f"/api/v1/materials/{material_id}")
            new_downloads = verify_response.json()["downloads"]
            assert new_downloads == initial_downloads + 1

    def test_material_engagement_workflow(self):
        """Test: browse → like → download → check stats"""
        # Login as parent
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Get initial stats
        stats_before = client.get("/api/v1/stats").json()
        initial_downloads = stats_before["total_downloads"]

        # Browse materials
        materials = client.get("/api/v1/materials").json()["items"]
        material_id = materials[0]["id"]

        # Get initial counts
        material_before = client.get(f"/api/v1/materials/{material_id}").json()
        initial_likes = material_before["likes"]
        initial_material_downloads = material_before["downloads"]

        # Like the material
        like_response = client.post(
            f"/api/v1/materials/{material_id}/like",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert like_response.status_code == 200

        # Download the material
        download_response = client.post(f"/api/v1/materials/{material_id}/download")
        assert download_response.status_code == 200

        # Verify material stats updated
        material_after = client.get(f"/api/v1/materials/{material_id}").json()
        assert material_after["likes"] == initial_likes + 1
        assert material_after["downloads"] == initial_material_downloads + 1

        # Verify global stats updated
        stats_after = client.get("/api/v1/stats").json()
        assert stats_after["total_downloads"] == initial_downloads + 1


class TestSearchAndFilterWorkflow:
    """Test search and filter workflows"""

    def test_progressive_filtering(self):
        """Test: all materials → filter type → add grade → add search"""
        # Step 1: Get all materials
        all_response = client.get("/api/v1/materials")
        all_total = all_response.json()["total"]
        assert all_total > 0

        # Step 2: Filter by type
        type_response = client.get("/api/v1/materials?type=game")
        type_total = type_response.json()["total"]
        assert type_total <= all_total
        assert type_total > 0

        # Step 3: Add grade filter
        type_grade_response = client.get(
            "/api/v1/materials?type=game&gradeLevel=grade2"
        )
        type_grade_total = type_grade_response.json()["total"]
        assert type_grade_total <= type_total

        # Step 4: Add search term
        full_filter_response = client.get(
            "/api/v1/materials?type=game&gradeLevel=grade2&search=math"
        )
        full_filter_total = full_filter_response.json()["total"]
        assert full_filter_total <= type_grade_total

        # Verify all results match all criteria
        for item in full_filter_response.json()["items"]:
            assert item["type"] == "game"
            assert item["grade_level"] == "grade2"

    def test_pagination_workflow(self):
        """Test: browse first page → next page → verify no duplicates"""
        page_size = 3

        # Get first page
        page1_response = client.get(f"/api/v1/materials?limit={page_size}&offset=0")
        page1 = page1_response.json()
        page1_items = page1["items"]
        total = page1["total"]

        # Get second page
        page2_response = client.get(
            f"/api/v1/materials?limit={page_size}&offset={page_size}"
        )
        page2_items = page2_response.json()["items"]

        # Verify no duplicates between pages
        page1_ids = {item["id"] for item in page1_items}
        page2_ids = {item["id"] for item in page2_items}
        assert len(page1_ids.intersection(page2_ids)) == 0

        # Verify total is consistent
        assert page2_response.json()["total"] == total


class TestAuthorizationWorkflow:
    """Test authorization and permission workflows"""

    def test_parent_cannot_submit_material(self):
        """Test that parent role cannot submit materials"""
        # Login as parent
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Attempt to submit material
        submit_response = client.post(
            "/api/v1/materials",
            json={
                "title": "Unauthorized Material",
                "description": "This should not be created",
                "type": "worksheet",
                "grade_level": "grade1",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert submit_response.status_code == 403

    def test_educator_can_submit_material(self):
        """Test that educator role can submit materials"""
        # Login as educator
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "teacher@example.com", "password": "password123"},
        )
        token = login_response.json()["access_token"]

        # Submit material
        submit_response = client.post(
            "/api/v1/materials",
            json={
                "title": "Authorized Material",
                "description": "This should be created successfully",
                "type": "worksheet",
                "grade_level": "grade1",
                "is_interactive": False,
                "tags": ["test"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert submit_response.status_code == 201

    def test_unauthenticated_access(self):
        """Test that unauthenticated users can browse but not interact"""
        # Can browse materials
        browse_response = client.get("/api/v1/materials")
        assert browse_response.status_code == 200

        # Can view material details
        detail_response = client.get("/api/v1/materials/1")
        assert detail_response.status_code == 200

        # Can download (no auth required)
        download_response = client.post("/api/v1/materials/1/download")
        assert download_response.status_code == 200

        # Cannot like (auth required)
        like_response = client.post("/api/v1/materials/1/like")
        assert like_response.status_code == 403

        # Cannot access profile
        profile_response = client.get("/api/v1/users/me")
        assert profile_response.status_code == 403


class TestErrorRecoveryWorkflow:
    """Test error handling and recovery workflows"""

    def test_invalid_login_then_valid_login(self):
        """Test recovery from failed login attempt"""
        # Attempt with wrong password
        fail_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "wrongpassword"},
        )
        assert fail_response.status_code == 401

        # Try again with correct password
        success_response = client.post(
            "/api/v1/auth/login",
            json={"email": "parent@example.com", "password": "password123"},
        )
        assert success_response.status_code == 200
        assert "access_token" in success_response.json()

    def test_search_no_results_then_valid_search(self):
        """Test recovery from empty search results"""
        # Search with no results
        empty_response = client.get("/api/v1/materials?search=xyznoresults")
        assert empty_response.status_code == 200
        assert empty_response.json()["total"] == 0

        # Search with valid term
        valid_response = client.get("/api/v1/materials?search=math")
        assert valid_response.status_code == 200
        assert valid_response.json()["total"] > 0

    def test_invalid_material_id_then_valid_id(self):
        """Test recovery from invalid material ID"""
        # Try invalid ID
        invalid_response = client.get("/api/v1/materials/invalid-id-999")
        assert invalid_response.status_code == 404

        # Try valid ID
        valid_response = client.get("/api/v1/materials/1")
        assert valid_response.status_code == 200
        assert valid_response.json()["id"] == "1"


class TestDataConsistency:
    """Test data consistency across operations"""

    def test_stats_consistency_after_operations(self):
        """Test that stats remain consistent after various operations"""
        # Get initial stats
        initial_stats = client.get("/api/v1/stats").json()
        initial_materials = initial_stats["total_materials"]
        initial_downloads = initial_stats["total_downloads"]

        # Perform some downloads
        client.post("/api/v1/materials/1/download")
        client.post("/api/v1/materials/2/download")

        # Check stats updated correctly
        updated_stats = client.get("/api/v1/stats").json()
        assert updated_stats["total_materials"] == initial_materials
        assert updated_stats["total_downloads"] == initial_downloads + 2

    def test_material_count_consistency(self):
        """Test that material counts are consistent across endpoints"""
        # Get total from list endpoint
        list_response = client.get("/api/v1/materials")
        list_total = list_response.json()["total"]

        # Get total from stats endpoint
        stats_response = client.get("/api/v1/stats")
        stats_total = stats_response.json()["total_materials"]

        # Should match
        assert list_total == stats_total
