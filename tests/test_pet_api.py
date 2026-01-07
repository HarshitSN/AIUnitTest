def test_create_pet_invalid(http_client: httpx.Client) -> None:
    """
    Invalid data: attempt to create a pet with missing name.
    """
    payload = {"status": "available"}
    resp = http_client.post("/pet", json=payload)
    assert resp.status_code == 400


def test_upload_image_validation(http_client: httpx.Client, created_pet_id: Optional[int]) -> None:
    """
    Validation: attempt to upload an image without a file.
    """
    if created_pet_id is None:
        pytest.skip("No pet created in fixture; skipping image upload test.")
    resp = http_client.post(f"/pet/{created_pet_id}/uploadImage")
    assert resp.status_code == 400


def test_find_by_status_empty(http_client: httpx.Client) -> None:
    """
    Edge case: Find pets by status when no pets exist.
    """
    resp = http_client.get("/pet/findByStatus", params={"status": ["available"]})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_auth_with_key(http_client: httpx.Client, created_pet_id: Optional[int]) -> None:
    """
    Authentication: ensure endpoints work with valid API key.
    """
    if created_pet_id is None:
        pytest.skip("No pet created in fixture; skipping auth test.")
    resp = http_client.get(f"/pet/{created_pet_id}", headers={"api_key": "special-key"})
    assert resp.status_code == 200
