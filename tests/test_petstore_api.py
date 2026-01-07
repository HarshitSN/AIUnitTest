def test_upload_image_invalid_format(http_client: httpx.Client, api_key_headers: Dict[str, str]) -> None:
    """
    Edge case: Attempt to upload an image with an invalid format should fail (415).
    """
    pet_id: int = _generate_unique_pet_id()
    pet: Dict[str, Any] = {
        "id": pet_id,
        "name": f"InvalidFormatPet-{pet_id}",
        "status": "available",
        "photoUrls": [],
    }
    create_resp: httpx.Response = http_client.post(f"{BASE_URL}/pet", json=pet)
    assert create_resp.status_code in (200, 201)

    files = {
        "file": ("test.txt", b"dummy content", "text/plain")  # Invalid format
    }
    data = {
        "additionalMetadata": "Uploaded via test"
    }
    headers = api_key_headers
    resp: httpx.Response = http_client.post(
        f"{BASE_URL}/pet/{pet_id}/uploadImage",
        data=data,
        files=files,
        headers=headers,
    )
    assert resp.status_code == 415  # Expecting unsupported media type


def test_get_pet_by_id_invalid_format(http_client: httpx.Client) -> None:
    """
    Edge case: Request a pet with an invalid ID format and expect a 400.
    """
    invalid_id = 'invalid_id'
    resp: httpx.Response = http_client.get(f"{BASE_URL}/pet/{invalid_id}")
    assert resp.status_code == 400  # Expecting bad request