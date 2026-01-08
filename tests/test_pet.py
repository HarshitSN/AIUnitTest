import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture
def session():
    """HTTP session for PET API tests."""
    s = requests.Session()
    yield s
    s.close()

@pytest.fixture
def unique_name():
    """Unique pet name for each test run."""
    return f"TestPet-{uuid4()}"

def test_create_pet_success(session, unique_name):
    """Happy path: create a pet with valid data and verify response."""
    payload = {
        "name": unique_name,
        "photoUrls": ["http://example.com/photo.jpg"]
    }
    resp = session.post(f"{BASE_URL}/pet", json=payload)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "id" in data
    assert data["name"] == unique_name

def test_get_pet_by_id_success(session, unique_name):
    """Happy path: create a pet and fetch it by its ID."""
    payload = {"name": unique_name, "photoUrls": ["http://example.com/photo.jpg"]}
    resp = session.post(f"{BASE_URL}/pet", json=payload)
    assert resp.status_code in (200, 201)
    pet_id = resp.json().get("id")
    assert pet_id is not None

    resp_get = session.get(f"{BASE_URL}/pet/{pet_id}")
    assert resp_get.status_code == 200
    data = resp_get.json()
    assert data["id"] == pet_id
    assert data["name"] == unique_name

def test_update_pet_success(session, unique_name):
    """Happy path: update a pet's details successfully."""
    payload = {"name": unique_name, "photoUrls": ["http://example.com/photo.jpg"]}
    resp = session.post(f"{BASE_URL}/pet", json=payload)
    assert resp.status_code in (200, 201)
    pet_id = resp.json()["id"]

    updated_name = unique_name + "_updated"
    update_payload = {
        "id": pet_id,
        "name": updated_name,
        "photoUrls": ["http://example.com/photo.jpg"],
        "status": "available"
    }
    resp_update = session.put(f"{BASE_URL}/pet", json=update_payload)
    assert resp_update.status_code in (200, 201)
    data = resp_update.json()
    assert data["id"] == pet_id
    assert data["name"] == updated_name

def test_delete_pet_success(session, unique_name):
    """Happy path: create a pet and delete it successfully."""
    payload = {"name": unique_name, "photoUrls": ["http://example.com/photo.jpg"]}
    resp = session.post(f"{BASE_URL}/pet", json=payload)
    assert resp.status_code in (200, 201)
    pet_id = resp.json()["id"]

    resp_del = session.delete(f"{BASE_URL}/pet/{pet_id}")
    assert resp_del.status_code in (200, 204)

    resp_get = session.get(f"{BASE_URL}/pet/{pet_id}")
    assert resp_get.status_code == 404

@pytest.mark.parametrize("pet_id", [0, 9999999999])
def test_get_pet_not_found(session, pet_id):
    """Not found: requesting non-existent pet should return 404."""
    resp = session.get(f"{BASE_URL}/pet/{pet_id}")
    assert resp.status_code == 404

def test_create_pet_invalid_input_missing_fields(session):
    """Validation error: missing required fields should return 400/422."""
    payload = {"photoUrls": []}  # Missing required 'name' and non-empty 'photoUrls'
    resp = session.post(f"{BASE_URL}/pet", json=payload)
    assert resp.status_code in (400, 422)