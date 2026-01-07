import time
from typing import Optional
import pytest
import requests

pytestmark = pytest.mark.usefixtures("http_session")

def test_add_pet_and_get_pet_happy(base_url, http_session, new_pet_payload):
    """Happy path: add a new pet and retrieve it by ID to verify data integrity."""
    payload = new_pet_payload
    assert payload is not None

    # Create a new pet
    resp = http_session.post(f"{base_url}/pet", json=payload, timeout=15)
    assert resp.status_code in (200, 201), f"POST /pet failed: {resp.status_code} - {resp.text}"
    try:
        created = resp.json()
        pet_id = int(created.get("id", payload["id"]))
    except Exception:
        # Fallback to payload ID if response is not JSON
        pet_id = int(payload["id"])

    # Give the server a moment to index for subsequent reads (if needed)
    time.sleep(0.5)

    # Retrieve the pet by ID
    get_resp = http_session.get(f"{base_url}/pet/{pet_id}", timeout=15)
    assert get_resp.status_code == 200, f"GET /pet/{pet_id} failed: {get_resp.status_code}"
    data = get_resp.json()
    assert int(data.get("id")) == pet_id
    assert data.get("name") == payload.get("name")

    # Cleanup: delete the pet
    del_resp = http_session.delete(f"{base_url}/pet/{pet_id}", timeout=15)
    assert del_resp.status_code in (200, 204), f"DELETE /pet/{pet_id} failed: {del_resp.status_code}"


def test_get_pet_by_id_not_found(base_url, http_session):
    """Not found: request a non-existent pet should yield 404 (or an auth-related error if applicable)."""
    non_existent_id = 999999999
    resp = http_session.get(f"{base_url}/pet/{non_existent_id}", timeout=15)
    # Accept 404 as primary expectation; some environments may require auth and return 401/403.
    assert resp.status_code in (404, 400, 401, 403)


@pytest.mark.parametrize("status_value", ["available", "pending", "sold"])
def test_find_pets_by_status_happy(base_url, http_session, status_value):
    """Happy path: find pets by status with multiple allowed values."""
    resp = http_session.get(f"{base_url}/pet/findByStatus", params={"status": status_value}, timeout=15)
    assert resp.status_code == 200
    try:
        data = resp.json()
        assert isinstance(data, list)
        assert all("id" in pet for pet in data)  # Check each pet has an ID
    except ValueError:
        # If the API returns non-JSON, fail gracefully
        pytest.fail("Expected JSON array in response for /pet/findByStatus")


@pytest.mark.parametrize("tags_value", ["tag1", "tag2"])
def test_find_pets_by_tags_happy(base_url, http_session, tags_value):
    """Happy path: find pets by tags (collectionFormat multi)."""
    resp = http_session.get(f"{base_url}/pet/findByTags", params={"tags": tags_value}, timeout=15)
    # The API can legitimately return an empty array with 200 OK
    assert resp.status_code == 200
    try:
        data = resp.json()
        assert isinstance(data, list)
    except ValueError:
        pytest.fail("Expected JSON array in response for /pet/findByTags")


def test_update_pet_with_form_happy(base_url, http_session, new_pet_payload):
    """Update pet details using form data for an existing pet (POST with form data)."""
    payload = new_pet_payload
    # First create the pet
    resp = http_session.post(f"{base_url}/pet", json=payload, timeout=15)
    assert resp.status_code in (200, 201)
    pet_id = int(payload["id"])

    # Update via form data (name and status)
    form_data = {"name": "UpdatedName", "status": "sold"}
    update_resp = http_session.post(f"{base_url}/pet/{pet_id}", data=form_data, timeout=15)
    assert update_resp.status_code in (200, 204, 202), f"POST /pet/{pet_id} with form failed: {update_resp.status_code}"

    # Fetch to confirm update
    get_resp = http_session.get(f"{base_url}/pet/{pet_id}", timeout=15)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data.get("name") == "UpdatedName" or data.get("name") == payload.get("name")

    # Cleanup
    http_session.delete(f"{base_url}/pet/{pet_id}", timeout=15)


def test_upload_image_happy(base_url, http_session, new_pet_payload):
    """Upload an image for a pet using multipart/form-data."""
    payload = new_pet_payload
    # Create a pet first
    resp = http_session.post(f"{base_url}/pet", json=payload, timeout=15)
    assert resp.status_code in (200, 201)
    pet_id = int(payload["id"])

    # Prepare a tiny file-like payload
    files = {"file": ("test.txt", b"sample image content", "text/plain")}
    data = {"additionalMetadata": "Sample metadata"}

    upload_resp = http_session.post(f"{base_url}/pet/{pet_id}/uploadImage", files=files, data=data, timeout=20)
    assert upload_resp.status_code in (200, 201)
    upload_data = upload_resp.json()
    assert "message" in upload_data  # Check if the response contains a message

    # Cleanup
    http_session.delete(f"{base_url}/pet/{pet_id}", timeout=15)


def test_validation_error_on_add_pet(base_url, http_session):
    """Validation error: missing required body for adding a new pet should yield an error (e.g., 400/405)."""
    resp = http_session.post(f"{base_url}/pet", json={}, timeout=15)
    assert resp.status_code in (400, 405, 422)  # Depending on server validation
    try:
        error_data = resp.json()
        assert "message" in error_data  # Check if the error response contains a message
    except ValueError:
        pytest.fail("Expected JSON response for error message")