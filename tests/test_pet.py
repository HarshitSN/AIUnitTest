import pytest
import httpx
from typing import Dict
from uuid import uuid4

# Helpers
def build_pet_payload(name: str) -> Dict:
    """Create a minimal valid Pet payload for the POST /pet operation."""
    return {
        "name": name,
        "status": "available",
        "photoUrls": ["http://example.com/photo.jpg"]
    }


def build_invalid_pet_payload() -> Dict:
    """Create an invalid Pet payload for testing validation errors."""
    return {
        "status": "available",  # Missing 'name' field
        "photoUrls": ["http://example.com/photo.jpg"]
    }

@pytest.mark.usefixtures("client")
def test_add_pet_happy(client, unique_pet_name, api_key_headers):
    """Happy path: add a new pet and verify basic fields, then read/update."""
    payload = build_pet_payload(unique_pet_name)

    # Create pet (requires authentication per spec)
    resp = client.post("/pet", json=payload, headers=api_key_headers)
    assert resp.status_code in (200, 201), f"Unexpected status: {resp.status_code}"
    data = resp.json()
    assert data.get("name") == unique_pet_name
    pet_id = data.get("id")
    assert isinstance(pet_id, int)

    # Read the created pet
    resp_read = client.get(f"/pet/{pet_id}", headers=api_key_headers)
    assert resp_read.status_code == 200
    assert resp_read.json().get("id") == pet_id

    # Update the pet with a new name
    updated = resp_read.json().copy()
    updated["name"] = updated.get("name", unique_pet_name) + "_updated"
    resp_update = client.put("/pet", json=updated, headers=api_key_headers)
    assert resp_update.status_code in (200, 201)

    # Read again to verify update
    resp_read_again = client.get(f"/pet/{pet_id}", headers=api_key_headers)
    assert resp_read_again.status_code == 200
    assert resp_read_again.json().get("name") == updated["name"]

@pytest.mark.usefixtures("client")
def test_add_pet_validation_error(client, api_key_headers):
    """Validation error: attempt to add a pet without a name should yield 400."""
    payload = build_invalid_pet_payload()
    resp = client.post("/pet", json=payload, headers=api_key_headers)
    assert resp.status_code == 400

@pytest.mark.usefixtures("client")
def test_find_by_status_happy(client, api_key_headers):
    """Happy path: find pets by status using a valid status value."""
    resp = client.get("/pet/findByStatus", params={"status": "available"}, headers=api_key_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        # Validate basic shape of first item if list is non-empty
        first = data[0]
        assert "id" in first
        assert "name" in first

@pytest.mark.usefixtures("client")
def test_find_by_tags_happy(client, api_key_headers):
    """Happy path: find pets by tags (two tags provided)."""
    resp = client.get("/pet/findByTags", params={"tags": ["tag1", "tag2"]}, headers=api_key_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        # Validate basic shape of first item if list is non-empty
        first = data[0]
        assert "id" in first
        assert "name" in first

@pytest.mark.usefixtures("client")
def test_get_pet_by_id_not_found(client, api_key_headers):
    """Not found: request a non-existent pet by ID should yield 404."""
    resp = client.get("/pet/9999999999999", headers=api_key_headers)
    assert resp.status_code == 404

@pytest.mark.usefixtures("client")
def test_get_pet_by_id_invalid_id(client, api_key_headers):
    """Not found/invalid: invalid ID format should yield 400."""
    resp = client.get("/pet/invalid-id", headers=api_key_headers)
    assert resp.status_code == 400

@pytest.mark.usefixtures("client")
def test_unauthorized_access_missing_auth(client):
    """Unauthorized: endpoints requiring auth should fail without api_key header."""
    resp = client.get("/pet/findByStatus", params={"status": "available"})
    # Some environments may return 401 or 403; accept both.
    assert resp.status_code in (401, 403)

@pytest.mark.usefixtures("client")
def test_upload_image_happy(client, api_key_headers):
    """Happy path: upload an image for a pet (requires an existing pet)."""
    # Step 1: create a pet to upload image to
    name = f"UploadPet-{pytest.importorskip('uuid').uuid4()}"
    payload = build_pet_payload(name)
    resp_create = client.post("/pet", json=payload, headers=api_key_headers)
    assert resp_create.status_code in (200, 201)
    pet_id = resp_create.json().get("id")
    assert isinstance(pet_id, int)

    # Step 2: upload an image for that pet
    files = {
        "file": ("pet.jpg", b"fake-image-bytes", "image/jpeg")
    }
    data = {"additionalMetadata": "test-upload"}
    resp_upload = client.post(f"/pet/{pet_id}/uploadImage", files=files, data=data, headers=api_key_headers)
    assert resp_upload.status_code in (200, 201)
    assert resp_upload.json().get("message") == 'Uploaded image successfully'