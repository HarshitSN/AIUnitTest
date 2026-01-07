def test_create_pet_with_invalid_data(http_session):
    """
    Validation error: Attempt to create a pet with invalid data should return 400.
    """
    invalid_pet = {
        "id": "not_a_number",
        "name": "",
        "photoUrls": []
    }
    resp = http_session.post(f"{BASE_URL}/pet", json=invalid_pet, timeout=15)
    assert resp.status_code in (400, 422), f"Expected validation error, got {resp.status_code}"


def test_update_pet_with_invalid_data(http_session, unique_pet_id):
    """
    Validation error: Attempt to update a pet with invalid data should return 400.
    """
    pet_id = unique_pet_id
    initial = {
        "id": pet_id,
        "name": "ValidPet",
        "photoUrls": ["http://example.com/photo.jpg"]
    }
    resp_create = http_session.post(f"{BASE_URL}/pet", json=initial, timeout=15)
    assert resp_create.status_code in (200, 201)

    # Attempt to update with invalid data
    invalid_update = {"name": "", "status": ""}
    resp_update = http_session.post(f"{BASE_URL}/pet/{pet_id}", data=invalid_update, timeout=15)
    assert resp_update.status_code in (400, 422), f"Expected validation error, got {resp_update.status_code}"
