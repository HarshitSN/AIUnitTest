def test_update_pet_happy_path():
    """Happy path: Update an existing pet should return 200."""
    pet_id = _random_id()
    payload = {
        "id": pet_id,
        "name": "UpdatedPet",
        "status": "available",
        "photoUrls": ["http://example.com/updatedpet.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag1"}]
    }
    create_resp = requests.post(f"{BASE_URL}/pet", json=payload, headers=HEADERS)
    if create_resp.status_code not in (200, 201):
        pytest.skip("Could not create pet for update test")
    update_resp = requests.put(f"{BASE_URL}/pet", json=payload, headers=HEADERS)
    assert update_resp.status_code == 200


def test_find_pets_by_tags_invalid():
    """Invalid tags should return 400."""
    resp = requests.get(f"{BASE_URL}/pet/findByTags", params={"tags": "invalidtag"}, headers=HEADERS)
    assert resp.status_code == 400
