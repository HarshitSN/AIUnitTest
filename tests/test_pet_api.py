def test_add_pet_invalid_payload(http_session):
    """
    Invalid payload: Attempt to add a pet with missing required fields.
    This should return a 400 Bad Request response.
    """
    payload = {
        "photoUrls": ["http://example.com/photo.jpg"]
    }
    resp = http_session.post(f"{BASE_URL}/pet", json=payload, timeout=15)
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}. Body: {resp.text}"


def test_get_pet_by_invalid_id(http_session):
    """
    Invalid ID: Request a pet by an ID that is not a number should return 400.
    """
    resp = http_session.get(f"{BASE_URL}/pet/invalid_id", timeout=15)
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}. Body: {resp.text}"


def test_find_pets_by_tags_invalid(http_session):
    """
    Invalid tags: Attempt to find pets with invalid tags should return 400.
    """
    resp = http_session.get(f"{BASE_URL}/pet/findByTags?tags=", timeout=15)
    assert resp.status_code == 400, f"Expected 400, got {resp.status_code}. Body: {resp.text}"
