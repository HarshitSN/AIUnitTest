import pytest
import requests
import uuid
from typing import Optional, Dict

BASE_OPENAPI_URL = "https://petstore.swagger.io/v2"


@pytest.fixture(scope="session")
def base_url() -> str:
    """Base URL for the Petstore API v2."""
    return BASE_OPENAPI_URL


@pytest.fixture(scope="session")
def http_session(base_url) -> requests.Session:
    """HTTP session with sensible defaults for tests."""
    session = requests.Session()
    # Some endpoints may return JSON by default; ensure JSON handling is straightforward.
    session.headers.update({"Content-Type": "application/json"})
    # Return the session to be reused by tests
    yield session
    session.close()


@pytest.fixture
def new_pet_payload() -> Optional[Dict]:
    """Generate a unique payload for creating a new pet."""
    pet_id = abs(uuid.uuid4().int) % (10 ** 7)
    payload = {
        "id": int(pet_id),
        "name": f"TestPet-{pet_id}",
        "status": "available",
        "photoUrls": [],
        "category": {"id": 0, "name": "string"},
        "tags": [],
    }
    return payload