def test_list_users_pagination_happy_path(base_url, session):
    resp = session.get(f"{base_url}/users", params={"page": 2})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    payload = resp.json()

    # Basic pagination fields
    assert "page" in payload and payload["page"] == 2
    assert "data" in payload and isinstance(payload["data"], list)
    assert "total" in payload and isinstance(payload["total"], int)
    assert "per_page" in payload
    assert "total_pages" in payload

    # Validate first-level item schema for users in the data array
    for user in payload["data"]:
        assert "id" in user
        assert isinstance(user["id"], int)
        assert "email" in user
        assert isinstance(user["email"], str)
        assert "first_name" in user
        assert isinstance(user["first_name"], str)
        assert "last_name" in user
        assert isinstance(user["last_name"], str)
        assert "avatar" in user
        assert isinstance(user["avatar"], str)

    # Validate response schema
    assert "total" in payload
    assert isinstance(payload["total"], int)
    assert "per_page" in payload
    assert isinstance(payload["per_page"], int)
    assert "total_pages" in payload
    assert isinstance(payload["total_pages"], int)

    # Validate that the data array is not empty
    assert len(payload["data"]) > 0


def test_update_user_schema_validation(base_url, session, created_user):
    user_id = created_user.get("id")
    payload = {"name": "Updated Name", "job": "Senior QA"}
    resp = session.put(f"{base_url}/users/{user_id}", json=payload)
    assert resp.status_code in (200, 201), f"Expected 200/201, got {resp.status_code}"
    data = resp.json()
    assert "id" in data
    assert "name" in data
    assert "job" in data
    assert data["name"] == payload["name"]
    assert data["job"] == payload["job"]
    assert "updatedAt" in data