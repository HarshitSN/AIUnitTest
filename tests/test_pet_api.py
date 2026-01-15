import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

def test_create_pet_success(base_url, auth_headers, pet_payload):
    """Happy path: Create a new pet with valid data."""
    response = requests.post(f"{base_url}/pet", json=pet_payload, headers=auth_headers)
    assert response.status_code in (200, 201)

@pytest.fixture(scope="module")
def created_pet(base_url, auth_headers, pet_payload):
    """Module-scoped fixture to ensure a pet exists for subsequent tests."""
    resp = requests.post(f"{base_url}/pet", json=pet_payload, headers=auth_headers)
    yield pet_payload
    # Cleanup: attempt to delete the pet if possible
    try:
        requests.delete(f"{base_url}/pet/{pet_payload['id']}", headers=auth_headers)
    except Exception:
        pass


def test_get_pet_by_id_happy_path(created_pet, base_url, auth_headers):
    """Happy path: Retrieve an existing pet by ID."""
    resp = requests.get(f"{base_url}/pet/{created_pet['id']}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("id") == created_pet["id"]


def test_update_pet_happy_path(created_pet, base_url, auth_headers):
    """Happy path: Update an existing pet with new data."""
    updated = created_pet.copy()
    updated["name"] = f"Updated-{uuid4().hex[:6]}"
    resp = requests.put(f"{base_url}/pet", json=updated, headers=auth_headers)
    assert resp.status_code in (200, 204)
    # Verify update
    resp2 = requests.get(f"{base_url}/pet/{created_pet['id']}", headers=auth_headers)
    if resp2.status_code == 200:
        assert resp2.json().get("name") == updated["name"]


def test_find_by_status_happy_path(base_url, auth_headers, created_pet):
    """Happy path: Find pets by status."""
    resp = requests.get(f"{base_url}/pet/findByStatus", params={"status":"available"}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert all(pet["status"] == "available" for pet in data)


def test_find_by_tags_happy_path(base_url, auth_headers, created_pet):
    """Happy path: Find pets by tags."""
    resp = requests.get(f"{base_url}/pet/findByTags", params={"tags":"tag1"}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Check if returned pets match the tags queried
    assert all("tag1" in pet.get("tags", []) for pet in data)


def test_get_pet_by_id_not_found(base_url, auth_headers):
    """Not found: Retrieve a non-existent pet."""
    resp = requests.get(f"{base_url}/pet/9999999999", headers=auth_headers)
    assert resp.status_code == 404


def test_get_pet_by_id_invalid_id(base_url, auth_headers):
    """Invalid ID: Retrieve with a non-numeric ID."""
    resp = requests.get(f"{base_url}/pet/invalid-id", headers=auth_headers)
    assert resp.status_code == 400


def test_upload_image_happy_path(created_pet, base_url, auth_headers):
    """Happy path: Upload an image for a pet."""
    import io
    file_like = io.BytesIO(b"dummy image content")
    files = {"file": ("image.png", file_like, "image/png")}
    payload = {"additionalMetadata": "Test upload"}
    resp = requests.post(f"{base_url}/pet/{created_pet['id']}/uploadImage", data=payload, files=files, headers=auth_headers)
    assert resp.status_code in (200, 201)
    # Validate response content
    assert "message" in resp.json()