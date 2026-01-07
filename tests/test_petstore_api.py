---TESTFILE: tests/test_petstore_api.py---
import pytest
import requests
from typing import Dict, Any
from uuid import uuid4

BASE_URL = "https://petstore.swagger.io/v2"

def _generate_pet_payload(pet_id: int) -> Dict[str, Any]:
    return {
        "id": pet_id,
        "name": f"TestPet-{pet_id}",
        "photoUrls": ["http://example.com/photo.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag"}],
        "status": "available",
    }

@pytest.mark.usefixtures("session")
def test_add_pet_happy_path(session: requests.Session) -> None:
    """Happy path: Create a new pet with valid data via POST /pet and verify response."""
    pet_id = int(__import__("uuid").uuid4().int % (10 ** 7))
    payload = _generate_pet_payload(pet_id)

    resp = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp.status_code in (200, 201, 202), f"Unexpected status: {resp.status_code}"
    data = resp.json()
    assert ("id" in data) or ("name" in data)

@pytest.mark.usefixtures("session")
def test_get_pet_by_id_happy_path(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Happy path: Retrieve an existing pet by ID using API key authentication."""
    pet_id = int(__import__("uuid").uuid4().int % (10 ** 7))
    payload = _generate_pet_payload(pet_id)
    resp = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp.status_code in (200, 201, 202)

    headers = dict(api_key_headers)
    resp_get = session.get(f"{BASE_URL}/pet/{pet_id}", headers=headers, timeout=15)
    assert resp_get.status_code == 200, f"Expected 200, got {resp_get.status_code}"
    data = resp_get.json()
    assert data.get("id") == pet_id

@pytest.mark.usefixtures("session")
def test_get_pet_by_id_not_found(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Not found: Request a non-existent pet by ID should return 404."""
    non_existent_id = 999999999
    resp = session.get(f"{BASE_URL}/pet/{non_existent_id}", headers=api_key_headers, timeout=15)
    assert resp.status_code == 404

@pytest.mark.usefixtures("session")
def test_update_pet_happy_path(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Happy path: Update an existing pet via PUT /pet and verify changes."""
    pet_id = int(__import__("uuid").uuid4().int % (10 ** 7))
    payload = _generate_pet_payload(pet_id)
    resp_post = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp_post.status_code in (200, 201, 202)

    updated = dict(payload)
    updated["name"] = f"{payload['name']}-updated"
    updated["status"] = "sold"

    resp_put = session.put(f"{BASE_URL}/pet", json=updated, headers=api_key_headers, timeout=15)
    assert resp_put.status_code in (200, 201, 202)

    resp_get = session.get(f"{BASE_URL}/pet/{pet_id}", headers=api_key_headers, timeout=15)
    assert resp_get.status_code == 200
    data = resp_get.json()
    assert data["name"] == updated["name"]
    assert data["status"] == "sold"

@pytest.mark.usefixtures("session")
def test_find_by_status_happy_path(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Happy path: Find pets by status with status=available."""
    resp = session.get(f"{BASE_URL}/pet/findByStatus?status=available", headers=api_key_headers, timeout=20)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)

@pytest.mark.usefixtures("session")
def test_find_by_tags_happy_path(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Happy path: Find pets by tags with tags=tag."""
    resp = session.get(f"{BASE_URL}/pet/findByTags?tags=tag", headers=api_key_headers, timeout=20)
    assert resp.status_code in (200, 400)
    if resp.status_code == 200:
        data = resp.json()
        assert isinstance(data, list)

@pytest.mark.usefixtures("session")
def test_upload_image_happy_path(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Happy path: Upload an image for a pet via POST /pet/{petId}/uploadImage."""
    pet_id = int(__import__("uuid").uuid4().int % (10 ** 7))
    payload = _generate_pet_payload(pet_id)
    resp_post = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp_post.status_code in (200, 201, 202)

    files = {"file": ("image.png", b"fake-image-content", "image/png")}
    data = {"additionalMetadata": "test-upload"}
    resp_upload = session.post(
        f"{BASE_URL}/pet/{pet_id}/uploadImage",
        data=data,
        files=files,
        headers=api_key_headers,
        timeout=20
    )
    assert resp_upload.status_code in (200, 201, 202)

@pytest.mark.usefixtures("session")
def test_concurrent_pet_creations(session: requests.Session) -> None:
    """Edge case: Create multiple pets concurrently to test race conditions."""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def create_pet(pet_id: int) -> int:
        payload = _generate_pet_payload(pet_id)
        r = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
        return r.status_code

    pet_ids = [int(__import__("uuid").uuid4().int % (10 ** 7)) for _ in range(2)]
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(create_pet, pid) for pid in pet_ids]
        for fut in as_completed(futures):
            code = fut.result()
            assert code in (200, 201, 202)

@pytest.mark.usefixtures("session")
def test_create_pet_with_invalid_data(session: requests.Session) -> None:
    """Invalid input: Attempt to create a pet with missing required fields should return 400."""
    payload = {"name": "", "photoUrls": []}  # Missing required fields
    resp = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp.status_code == 400

@pytest.mark.usefixtures("session")
def test_concurrent_updates(session: requests.Session, api_key_headers: Dict[str, str]) -> None:
    """Edge case: Update the same pet concurrently to test race conditions."""
    pet_id = int(__import__("uuid").uuid4().int % (10 ** 7))
    payload = _generate_pet_payload(pet_id)
    resp_post = session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp_post.status_code in (200, 201, 202)

    def update_pet(name: str) -> int:
        updated = dict(payload)
        updated["name"] = name
        resp_put = session.put(f"{BASE_URL}/pet", json=updated, headers=api_key_headers, timeout=15)
        return resp_put.status_code

    names = ["Pet-1", "Pet-2"]
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(update_pet, name) for name in names]
        for fut in as_completed(futures):
            code = fut.result()
            assert code in (200, 201, 202)
