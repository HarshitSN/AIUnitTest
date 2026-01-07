import pytest

BASE_URL = "https://petstore.swagger.io/v2"

def test_unauthorized_access_to_pet_by_id(http_session):
    """
    Access control sanity: Attempt to fetch a pet by ID without authentication tokens.
    Depending on server configuration, this may return 200 (open policy) or 401/403.
    We assert that the response is one of the expected security outcomes.
    """
    # Create a pet first to ensure there is an existing resource
    payload = {
        "id": 0,
        "name": f"AuthTestPet-{pytest.importorskip('uuid', reason='uuid module') and __import__('uuid').uuid4()}",
        "photoUrls": ["http://example.com/photo.jpg"]
    }
    resp = http_session = pytest.importorskip("requests").Session()
    resp.headers.update({"Content-Type": "application/json"})
    r = resp.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    pet_id = None
    try:
        data = r.json()
        pet_id = data.get("id") if isinstance(data, dict) else None
    except Exception:
        pass
    if not pet_id:
        pytest.skip("Could not create a pet to test auth behavior.")
    # Try to access without an API key
    r_no_auth = resp.get(f"{BASE_URL}/pet/{pet_id}", timeout=15)
    assert r_no_auth.status_code in (200, 401, 403, 404)