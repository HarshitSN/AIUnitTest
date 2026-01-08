import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture
def session():
    """HTTP session for USER API tests."""
    s = requests.Session()
    yield s
    s.close()

@pytest.fixture
def username():
    """Unique username for testing."""
    return f"user-{uuid4()}"

def test_create_user_success(session, username):
    """Happy path: create a user and verify retrieval by username."""
    payload = {
        "id": 0,
        "username": username,
        "firstName": "Test",
        "lastName": "User",
        "email": f"{username}@example.com",
        "password": "pass",
        "phone": "123-456-7890",
        "userStatus": 0
    }
    resp = session.post(f"{BASE_URL}/user", json=payload)
    assert resp.status_code in (200, 201)

    resp_get = session.get(f"{BASE_URL}/user/{username}")
    assert resp_get.status_code == 200
    data = resp_get.json()
    assert data["username"] == username

def test_get_user_not_found(session):
    """Not found: retrieving a non-existent user should return 404."""
    resp = session.get(f"{BASE_URL}/user/nonexistent-{uuid4()}")
    assert resp.status_code == 404

def test_delete_user_success(session, username):
    """Happy path: create a user and then delete it."""
    payload = {
        "id": 0,
        "username": username,
        "firstName": "Test",
        "lastName": "User",
        "email": f"{username}@example.com",
        "password": "pass",
        "phone": "123-456-7890",
        "userStatus": 0
    }
    resp = session.post(f"{BASE_URL}/user", json=payload)
    assert resp.status_code in (200, 201)

    resp_del = session.delete(f"{BASE_URL}/user/{username}")
    assert resp_del.status_code in (200, 204)

    resp_get = session.get(f"{BASE_URL}/user/{username}")
    assert resp_get.status_code == 404

def test_create_user_invalid_input(session):
    """Validation error: missing required username should fail."""
    payload = {"firstName": "Test"}  # missing 'username'
    resp = session.post(f"{BASE_URL}/user", json=payload)
    assert resp.status_code in (400, 422)