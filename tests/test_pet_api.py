def test_create_pet_invalid_data():
    """
    Invalid data: Attempt to create a pet without a name.
    Expects a 400 Bad Request response.
    """
    payload = {
        "photoUrls": ["http://example.com/photo.jpg"]
    }
    resp = requests.post(f"{BASE_URL}/pet", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 400


def test_update_pet_invalid_data(create_pet):
    """
    Invalid data: Attempt to update a pet with missing fields.
    Expects a 400 Bad Request response.
    """
    pet_id, _ = create_pet()
    payload = {"id": pet_id}  # Missing required fields
    resp = requests.put(f"{BASE_URL}/pet", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 400
