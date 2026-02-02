import pytest
import requests
import os
from uuid import uuid4

# OpenAPI spec URL (for reference; tests here are based on the live API at reqres.in)
OPENAPI_SPEC_URL = "https://reqres.in/api/openapi.yaml"

# Base URL for the API under test
BASE_URL = os.environ.get("BASE_URL", "https://reqres.in/api")


@pytest.fixture(scope="session")
def base_url():
    """
    Base URL fixture for the API under test.
    """
    return BASE_URL.rstrip("/")


@pytest.fixture
def session():
    """
    A lightweight HTTP session to reuse TCP connections across requests.
    """
    with requests.Session() as s:
        yield s


@pytest.fixture
def unique_payload():
    """
    Helper to generate a unique user payload to avoid clashes in tests.
    """
    name = f"Test User {uuid4()}"
    job = "QA Engineer"
    return {"name": name, "job": job}


@pytest.fixture
def created_user(session, base_url):
    """
    Create a user for test scenarios that require an existing resource.
    Yields the created user data and cleans up after the test.
    """
    payload = {"name": f"Temp User {uuid4()}", "job": "Tester"}
    resp = session.post(f"{base_url}/users", json=payload)
    # Post to /users typically returns 201; be tolerant to 200 as well for resilience
    assert resp.status_code in (201, 200)
    user = resp.json()

    yield user

    # Cleanup
    user_id = user.get("id")
    if user_id:
        try:
            session.delete(f"{base_url}/users/{user_id}")
        except Exception:
            pass  # Best-effort cleanup; don't fail the test on cleanup issues