import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")
AUTH_HEADERS = {"api_key": "special-key"}

@pytest.fixture
def base_url():
    """Base URL for the Petstore API."""
    return BASE_URL

@pytest.fixture
def auth_headers():
    """Authentication headers (api_key) used across requests."""
    return AUTH_HEADERS

@pytest.fixture
def pet_payload():
    """Base payload for creating a test pet. Uses a unique ID to avoid collisions."""
    pet_id = abs(uuid4().int) % 1_000_000
    payload = {
        "id": pet_id,
        "name": f"TestPet-{uuid4().hex[:6]}",
        "status": "available",
        "photoUrls": [],
    }
    return payload