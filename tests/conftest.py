import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture(scope="session")
def base_url():
    """Base URL for the API under test."""
    return BASE_URL

@pytest.fixture
def session():
    """Requests session for reuse across tests."""
    s = requests.Session()
    yield s
    s.close()

@pytest.fixture
def unique_name():
    """Provide a unique name for resources to avoid collisions."""
    return f"Test-{uuid4()}"