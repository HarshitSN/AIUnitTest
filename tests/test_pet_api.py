def test_update_pet_not_found(auth_headers, json_headers):
    """Not found: Attempt to update a non-existent pet and expect 404."""
    non_existent_id = 999999999
    update_url = f"{BASE_URL}/pet"
    updated_payload = {
        "id": non_existent_id,
        "name": "NonExistentPet",
        "status": "available"
    }
    resp_update = requests.put(update_url, json=updated_payload, headers={**json_headers, **auth_headers})
    assert resp_update.status_code == 404, f"Expected 404 for not found, got {resp_update.status_code}"


def test_upload_image_check_response(auth_headers, new_pet_payload, json_headers):
    """Happy path: Upload an image for an existing pet and check response message."""
    # Create a pet first to ensure there is a pet to upload to
    create_url = f"{BASE_URL}/pet"
    payload = dict(new_pet_payload)
    headers = dict(json_headers)
    headers.update(auth_headers)
    resp_create = requests.post(create_url, json=payload, headers=headers)
    assert resp_create.status_code in (200, 201)
    pet_id = resp_create.json().get("id", payload["id"])

    url = f"{BASE_URL}/pet/{pet_id}/uploadImage"
    files = {"file": ("test.txt", b"hello world", "text/plain")}
    data = {"additionalMetadata": "test upload"}
    resp_upload = requests.post(url, files=files, data=data, headers=headers)
    assert resp_upload.status_code in (200, 201)
    # Check for specific response message
    resp_json = resp_upload.json()
    assert "message" in resp_json, "Response should contain a 'message' field"


def test_find_by_tags_check_structure(auth_headers, json_headers):
    """Happy path: Find pets by tags and check structure of returned data."""
    url = f"{BASE_URL}/pet/findByTags"
    params = [("tags", "tag1"), ("tags", "tag2")]
    resp = requests.get(url, headers={**json_headers, **auth_headers}, params=params)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        for pet in data:
            assert "id" in pet and "name" in pet, "Each pet should have 'id' and 'name' fields"