def test_get_users_pagination(api_base_url: str, api_session: requests.Session) -> None:
    """Check pagination works correctly with page query parameter."""
    url = f"{api_base_url}/users"
    resp = api_session.get(url, params={"page": 1})
    assert resp.status_code == 200
    payload: Dict[str, Any] = resp.json()
    assert "data" in payload and isinstance(payload["data"], list)
    assert "total" in payload and isinstance(payload["total"], int)
    assert "total_pages" in payload and isinstance(payload["total_pages"], int)
    assert payload["total_pages"] >= 1

    # Check if the next page returns a different set of users
    resp_next = api_session.get(url, params={"page": 2})
    assert resp_next.status_code == 200
    payload_next: Dict[str, Any] = resp_next.json()
    assert "data" in payload_next and isinstance(payload_next["data"], list)
    assert len(payload_next["data"]) > 0

    # Ensure that the first user of the next page is different from the first user of the current page
    if payload["data"] and payload_next["data"]:
        assert payload["data"][0]["id"] != payload_next["data"][0]["id"]

    # Validate response schema for POST and PUT requests
    def test_post_user_schema(api_base_url: str, api_session: requests.Session) -> None:
        """Validate response schema for creating a user."""
        name = f"Test User {uuid4()}"
        job = "Software Developer"
        payload = {"name": name, "job": job}
        resp = api_session.post(f"{api_base_url}/users", json=payload)
        assert resp.status_code == 201
        data: Dict[str, Any] = resp.json()
        assert "name" in data
        assert "job" in data
        assert "id" in data
        assert "createdAt" in data

    def test_put_user_schema(api_base_url: str, api_session: requests.Session) -> None:
        """Validate response schema for updating a user."""
        payload = {"name": "Updated Name", "job": "Updated Job"}
        resp = api_session.put(f"{api_base_url}/users/2", json=payload)
        assert resp.status_code == 200
        data: Dict[str, Any] = resp.json()
        assert "name" in data
        assert "job" in data
        assert "updatedAt" in data