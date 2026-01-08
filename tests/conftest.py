import pytest
import requests
from typing import Dict, Any

BASE_URL: str = "https://petstore.swagger.io/v2"


@pytest.fixture(scope="session")
def http_session() -> requests.Session:
    """
    Session fixture for making HTTP requests to the Petstore API.
    Configured to accept JSON responses and send JSON payloads by default.
    """
    s = requests.Session()
    s.headers.update({"Accept": "application/json", "Content-Type": "application/json"})
    return s


@pytest.fixture
def unique_pet_payload() -> Dict[str, Any]:
    """
    Provides a unique Pet payload for tests to avoid conflicts.
    """
    import uuid
    name = f"TestPet-{uuid.uuid4()}"
    payload: Dict[str, Any] = {
        "name": name,
        "photoUrls": ["http://example.com/photo.jpg"],
        "status": "available"
    }
    return payload


@pytest.fixture
def api_key_header() -> Dict[str, str]:
    """
    API key header used for endpoints that require authentication.
    """
    return {"api_key": "special-key"}
