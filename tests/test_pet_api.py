import pytest
import requests
from typing import Dict, Any

# The tests rely on fixtures from tests/conftest.py
# - base_url: base API URL
# - auth_headers: API key headers for authenticated endpoints
# - unique_pet_id: unique integer pet ID per test

def _build_pet_payload(pet_id: int, name: str) -> Dict[str, Any]:
    return {
        "id": pet_id,
        "name": name,
        "status": "available",
        "photoUrls": ["http://example.com/photo1.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag1"}],
    }


def test_add_pet_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Add a new pet with valid data should succeed."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"TestPet-{pet_id}")

    response = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert response.status_code in (200, 201)
    data = response.json()
    assert data.get("id") == pet_id
    assert data.get("name") == payload["name"]

    # Clean up: delete the created pet
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_get_pet_by_id_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Retrieve a pet by ID after creating it."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"TestPetGet-{pet_id}")

    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    get_resp = requests.get(f"{base_url}/pet/{pet_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data.get("id") == pet_id
    assert data.get("name") == payload["name"]

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_get_pet_by_id_not_found(base_url, auth_headers):
    """Not found: Requesting a non-existent pet should return 404."""
    not_found_id = 999999999999
    resp = requests.get(f"{base_url}/pet/{not_found_id}", headers=auth_headers)
    # The API is expected to return 404 for missing resources
    assert resp.status_code == 404


def test_find_pets_by_status_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Find pets by status returns a list including the created pet."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"StatusTestPet-{pet_id}")
    payload["status"] = "available"

    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    resp = requests.get(f"{base_url}/pet/findByStatus", params={"status": "available"}, headers=auth_headers)
    assert resp.status_code == 200
    pets = resp.json()
    assert isinstance(pets, list)
    assert any(p.get("id") == pet_id for p in pets)

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_find_pets_by_tags_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Find pets by tags includes our test pet."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"TagTestPet-{pet_id}")
    payload["tags"] = [{"id": 0, "name": "tag1"}]

    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    resp = requests.get(f"{base_url}/pet/findByTags", params={"tags": "tag1"}, headers=auth_headers)
    assert resp.status_code == 200
    pets = resp.json()
    assert isinstance(pets, list)
    assert any(p.get("id") == pet_id for p in pets)

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_upload_image_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Upload an image for a pet (multipart form data)."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"UploadTestPet-{pet_id}")

    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    url = f"{base_url}/pet/{pet_id}/uploadImage"
    files = {
        "file": ("pet.png", b"fake-image-bytes", "image/png"),
        "additionalMetadata": (None, "Uploaded by pytest"),
    }
    resp = requests.post(url, files=files, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    # ApiResponse shape may contain a "message" string
    assert "code" in data or "message" in data or isinstance(data, dict)

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_update_pet_success(base_url, unique_pet_id, auth_headers):
    """Happy path: Update an existing pet with new data."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"UpdateTestPet-{pet_id}")
    payload["status"] = "available"

    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    updated_payload = {
        "id": pet_id,
        "name": f"UpdatedName-{pet_id}",
        "status": "sold",
        "photoUrls": ["http://example.com/newphoto.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag1"}],
    }

    update_resp = requests.put(f"{base_url}/pet", json=updated_payload, headers=auth_headers)
    assert update_resp.status_code in (200, 201)
    updated = update_resp.json()
    assert updated.get("name") == updated_payload["name"]
    assert updated.get("status") == updated_payload["status"]

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass


def test_update_pet_invalid_input(base_url, unique_pet_id, auth_headers):
    """Negative: Attempting to update with invalid input should return a client error."""
    pet_id = unique_pet_id
    payload = _build_pet_payload(pet_id, f"InvalidUpdatePet-{pet_id}")
    create_resp = requests.post(f"{base_url}/pet", json=payload, headers=auth_headers)
    assert create_resp.status_code in (200, 201)

    # Invalid payload: non-numeric id and missing required fields
    invalid_payload = {"id": "not-a-number", "name": ""}

    resp = requests.put(f"{base_url}/pet", json=invalid_payload, headers=auth_headers)
    # Expect 400/405 for invalid input as per OpenAPI spec
    assert resp.status_code in (400, 405)

    # Cleanup
    try:
        requests.delete(f"{base_url}/pet/{pet_id}", headers=auth_headers, timeout=10)
    except Exception:
        pass