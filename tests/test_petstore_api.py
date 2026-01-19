import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture(scope="module")
def created_pet():
    """Create a pet for happy-path tests and return its data."""
    pet_id = int(uuid4().int % (10**10))
    payload = {
        "id": pet_id,
        "name": "TestPet-" + uuid4().hex[:6],
        "photoUrls": ["https://example.com/photo.jpg"],
        "status": "available"
    }
    resp = requests.post(f"{BASE_URL}/pet", json=payload, timeout=10)
    assert resp.status_code in (200, 201)
    return payload

def test_get_pet_by_id_happy_path(created_pet):
    """Happy path: Retrieve a pet by its ID after creation."""
    resp = requests.get(f"{BASE_URL}/pet/{created_pet['id']}", timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("id") == created_pet["id"]
    assert data.get("name") == created_pet["name"]


def test_update_pet_happy_path(created_pet):
    """Happy path: Update an existing pet using PUT /pet."""
    updated = {
        "id": created_pet["id"],
        "name": created_pet["name"],
        "photoUrls": created_pet["photoUrls"],
        "status": "sold"
    }
    resp = requests.put(f"{BASE_URL}/pet", json=updated, timeout=10)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data.get("id") == updated["id"]
    assert data.get("status") == "sold"


def test_upload_image_happy_path(created_pet):
    """Happy path: Upload an image for a pet via /pet/{petId}/uploadImage."""
    files = {'file': ('test.txt', b'test file content', 'text/plain')}
    data = {'additionalMetadata': 'upload-meta'}
    resp = requests.post(f"{BASE_URL}/pet/{created_pet['id']}/uploadImage", data=data, files=files, timeout=20)
    assert resp.status_code in (200, 201)
    assert isinstance(resp.json(), dict)


def test_find_by_status_happy_path():
    """Happy path: Find pets by status."""
    resp = requests.get(f"{BASE_URL}/pet/findByStatus?status=available", timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_find_by_tags_happy_path():
    """Happy path: Find pets by tags (deprecated endpoint)."""
    resp = requests.get(f"{BASE_URL}/pet/findByTags?tags=tag1", timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_pet_not_found_404():
    """Not found: Request a non-existent pet by ID should return 404 or 400."""
    resp = requests.get(f"{BASE_URL}/pet/999999999999", timeout=10)
    assert resp.status_code in (404, 400)


def test_update_pet_not_found():
    """Edge: Update a non-existent pet should yield 404 or 400."""
    payload = {
        "id": int(uuid4().int % (10**10)),
        "name": "NonExistentPet",
        "photoUrls": ["https://example.com/photo.jpg"],
        "status": "available"
    }
    resp = requests.put(f"{BASE_URL}/pet", json=payload, timeout=10)
    assert resp.status_code in (404, 400)


def test_invalid_input_missing_fields():
    """Validation: Missing required fields should return 400/405."""
    payload = {"name": "IncompletePet"}  # missing photoUrls
    resp = requests.post(f"{BASE_URL}/pet", json=payload, timeout=10)
    assert resp.status_code in (400, 405)


def test_authentication_required_fail():
    """Security: Access with invalid API key should be rejected (401/403)."""
    resp = requests.get(f"{BASE_URL}/pet/findByStatus?status=available", headers={"api_key": "invalid-key"}, timeout=10)
    assert resp.status_code in (401, 403)


def test_authentication_success():
    """Security: Access with valid API key should succeed (200)."""
    resp = requests.get(f"{BASE_URL}/pet/findByStatus?status=available", headers={"api_key": "valid-key"}, timeout=10)
    assert resp.status_code == 200