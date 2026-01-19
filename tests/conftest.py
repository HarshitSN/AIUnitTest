import pytest
import os
import requests

# Base API URL (Petstore OpenAPI v2)
BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

# Simple API key header used by the public sample API (as described in the OpenAPI spec)
AUTH_HEADERS = {"api_key": "special-key"}

@pytest.fixture
def base_url():
    """
    Pytest fixture providing the base URL for API calls.
    """
    return BASE_URL

@pytest.fixture
def auth_headers():
    """
    Pytest fixture providing default authentication headers for endpoints that require an API key.
    """
    return AUTH_HEADERS

@pytest.fixture
def created_pet_ids():
    """
    Tracks created pet IDs during a test and ensures cleanup after test completion.
    """
    ids = []
    yield ids
    for pet_id in ids:
        try:
            requests.delete(f"{BASE_URL}/pet/{pet_id}", headers=AUTH_HEADERS)
        except Exception:
            pass  # Best-effort cleanup; test environment may not allow deletes