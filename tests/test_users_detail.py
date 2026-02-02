import pytest
import requests
import os
from uuid import uuid4

"""
Tests for individual user resources and update/delete flows.

Scenarios:
- Happy path: GET by ID returns user data.
- Not found: GET by a non-existent ID returns 404.
- Update: PUT updates an existing user.
- Delete: DELETE an existing user and verify it is removed.
"""

def test_get_user_by_id_happy(base_url, session):
    """Happy path: Retrieve a known user by ID and validate the response structure."""
    resp = session.get(f"{base_url}/users/2")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    payload = resp.json()
    assert "data" in payload
    user = payload["data"]
    assert user["id"] == 2
    assert "first_name" in user and "last_name" in user
    assert "avatar" in user

def test_get_user_not_found(base_url, session):
    """Not found: Access a non-existent user should yield a 404 response."""
    resp = session.get(f"{base_url}/users/999999")
    assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"
    # Some APIs may return a body; ensure it is a valid JSON object if present
    try:
        payload = resp.json()
        assert isinstance(payload, dict)
    except ValueError:
        # No content; still acceptable for 404
        pass

def test_update_user_happy_path(base_url, session, created_user):
    """Happy path: Update an existing user's details via PUT."""
    user_id = created_user.get("id")
    payload = {"name": "Updated Name", "job": "Senior QA"}
    resp = session.put(f"{base_url}/users/{user_id}", json=payload)
    assert resp.status_code in (200, 201), f"Expected 200/201, got {resp.status_code}"
    data = resp.json()
    assert data.get("name") == payload["name"]
    assert data.get("job") == payload["job"]

def test_delete_user_happy_path(base_url, session, created_user):
    """Happy path: Delete an existing user and verify deletion (404 on subsequent fetch)."""
    user_id = created_user.get("id")
    resp = session.delete(f"{base_url}/users/{user_id}")
    assert resp.status_code in (204, 200), f"Expected 204/200, got {resp.status_code}"

    # Verify deletion
    resp2 = session.get(f"{base_url}/users/{user_id}")
    # Some implementations might still return 200 with null data; handle both cases
    if resp2.status_code == 404:
        assert resp2.json().get("data", None) is None
    elif resp2.status_code == 200:
        payload = resp2.json()
        assert payload.get("data") is None or payload.get("data") == {}
    else:
        pytest.fail(f"Unexpected status code after deletion: {resp2.status_code}")