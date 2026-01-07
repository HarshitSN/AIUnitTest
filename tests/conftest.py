import pytest
import requests
from typing import Dict, Any
from uuid import uuid4

BASE_URL: str = "https://petstore.swagger.io/v2"

@pytest.fixture(scope="session")
def session() -> requests.Session:
    """
    Shared HTTP session for tests. Keeps connections alive for speed.
    """
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s

@pytest.fixture
def api_key_headers() -> Dict[str, str]:
    """
    Headers carrying the API key used by endpoints that require authentication.
    """
    return {"api_key": "special-key"}

@pytest.fixture
def unique_pet_id() -> int:
    """
    Generate a reasonably unique pet id for test data.
    """
    return int(uuid4().int % (10 ** 7))