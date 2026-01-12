def test_find_pets_by_tags_happy_path(session, base_url):
    """Happy path: Find pets by tags (single tag)."""
    resp = session.get(f"{base_url}/pet/findByTags", params={"tags": "tag1"}, timeout=10)
    assert resp.status_code == 200, f"Status: {resp.status_code} - {resp.text}"
    try:
        data = resp.json()
    except ValueError:
        data = []
    assert isinstance(data, list)


def test_add_pet_invalid_payload(session, base_url):
    """Invalid payload: Attempt to add a pet with missing required fields."""
    invalid_payload = {"name": "TestPet"}  # Missing 'photoUrls'
    resp = session.post(f"{base_url}/pet", json=invalid_payload, timeout=10)
    assert resp.status_code == 400, f"Expected 400 for invalid payload, got {resp.status_code}"


def test_find_pets_by_status_pending(session, base_url):
    """Check for pets with 'pending' status."""
    resp = session.get(f"{base_url}/pet/findByStatus", params={"status": "pending"}, timeout=10)
    assert resp.status_code == 200, f"Status: {resp.status_code} - {resp.text}"
    try:
        data = resp.json()
    except ValueError:
        data = []
    assert isinstance(data, list)