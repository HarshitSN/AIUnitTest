import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture
def auth_headers():
    """Return authentication headers used across tests (api_key)."""
    return {"api_key": "special-key"}

@pytest.fixture
def base_url():
    """Provide the base URL for tests."""
    return BASE_URL

@pytest.fixture
def random_pet_id():
    """Provide a random numeric pet id to avoid collisions."""
    return abs(uuid4().int % 1_000_000_000)