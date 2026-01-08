def test_get_pet_by_id_not_found(http_session: requests.Session) -> None:
    """
    Not found path: request a non-existent pet by ID and expect 404 (or equivalent).
    """
    resp = http_session.get(f"{BASE_URL}/pet/9999999999")
    assert resp.status_code == 404


def test_unauthorized_get_pet_with_invalid_api_key(http_session: requests.Session, unique_pet_payload: Dict[str, Any]) -> None:
    """
    Authentication path: create a pet, then fetch it using an invalid API key header to exercise auth.
    Expecting a 403 response.
    """
    payload = unique_pet_payload
    create_resp = http_session.post(f"{BASE_URL}/pet", json=payload)
    assert create_resp.status_code in (200, 201)
    pet_id = create_resp.json().get("id")
    assert pet_id is not None

    resp_with_invalid_key = http_session.get(f"{BASE_URL}/pet/{pet_id}", headers={"api_key": "invalid-key"})
    assert resp_with_invalid_key.status_code == 403


def test_upload_image(http_session: requests.Session, unique_pet_payload: Dict[str, Any]) -> None:
    """
    Test uploading an image for a pet and validate the response structure.
    """
    payload = unique_pet_payload
    create_resp = http_session.post(f"{BASE_URL}/pet", json=payload)
    assert create_resp.status_code in (200, 201)
    pet_id = create_resp.json().get("id")
    assert pet_id is not None

    with open("tests/test_image.jpg", "wb") as image_file:
        image_file.write(b"fake image data")

    files = {'file': open("tests/test_image.jpg", 'rb')}
    upload_resp = http_session.post(f"{BASE_URL}/pet/{pet_id}/uploadImage", files=files)
    assert upload_resp.status_code == 200
    assert "message" in upload_resp.json()
    assert upload_resp.json()["message"] == "Uploaded image successfully"
