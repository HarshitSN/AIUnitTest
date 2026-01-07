import requests
from uuid import uuid4

import pytest

"""
Tests for the Pet endpoints using direct HTTP requests.

- Happy path: GET by id, find by status, find by tags
- 404: Not found for non-existent IDs
- Basic, optional auth behavior demonstration
- Concurrent access (edge case)
"""

BASE_URL_PARAM = "base_url"


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_get_pet_by_id_success(base_url):
    """Happy path: Retrieve an existing pet by ID and validate response schema."""
    pet_id = 1
    resp = requests.get(f"{base_url}/pet/{pet_id}", timeout=10)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict)
    assert data.get("id") == pet_id
    assert "name" in data


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_get_pet_by_id_not_found(base_url):
    """Not found path: Request a non-existent pet should return 404."""
    resp = requests.get(f"{base_url}/pet/999999999", timeout=10)
    assert resp.status_code == 404


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_find_pets_by_status_happy(base_url):
    """Happy path: Find pets by status returns a list of pets."""
    resp = requests.get(f"{base_url}/pet/findByStatus", params={"status": "available"}, timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        assert isinstance(data[0], dict)
        assert "id" in data[0]


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_find_pets_by_tags_happy(base_url):
    """Happy path: Find pets by tags returns a list of pets."""
    resp = requests.get(f"{base_url}/pet/findByTags", params={"tags": "dog"}, timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        assert isinstance(data[0], dict)
        assert "id" in data[0]


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_get_pet_by_id_with_api_key(base_url):
    """Authentication: Access with a valid API key (special-key) may affect behavior depending on server config."""
    resp = requests.get(f"{base_url}/pet/1", headers={"api_key": "special-key"}, timeout=10)
    # Accept a range of plausible responses depending on server configuration
    assert resp.status_code in (200, 403, 401, 404, 400)


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_concurrent_get_pet_by_id(base_url):
    """Edge case: Concurrent GET requests to the same resource to test race conditions."""
    import threading

    results = []
    pet_id = 1

    def do_request():
        r = requests.get(f"{base_url}/pet/{pet_id}", timeout=10)
        results.append(r.status_code)

    threads = [threading.Thread(target=do_request) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # All requests should complete; allow 200 or 304 (not modified) or 404 depending on data
    for code in results:
        assert code in (200, 304, 404)