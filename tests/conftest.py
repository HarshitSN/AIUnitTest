import pytest
import httpx
from typing import Optional, Generator

BASE_URL: str = "https://petstore.swagger.io/v2"

def maybe_build_pet_payload(name: str, status: str = "available") -> Optional[dict]:
    """
    Helper that returns a Pet payload if a valid name is provided.
    Returns Optional[dict] to satisfy typing requirements.
    """
    if not name:
        return None
    return {"name": name, "status": status}

@pytest.fixture(scope="session")
def http_client() -> httpx.Client:
    """
    Global HTTP client for tests. Uses the base URL from the OpenAPI spec.
    Provides a single session for reuse during the test run.
    """
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        yield client

@pytest.fixture
def unique_pet_name() -> str:
    """
    Generate a unique pet name for tests to avoid collisions.
    """
    import uuid
    return f"TestPet-{uuid.uuid4()}"

@pytest.fixture
def created_pet_id(http_client: httpx.Client, unique_pet_name: str) -> Optional[int]:
    """
    Create a pet and yield its ID for tests that require an existing resource.
    Cleans up by attempting to delete the pet after the test completes.
    Returns Optional[int]: the pet ID if creation succeeded, else None.
    """
    payload = maybe_build_pet_payload(unique_pet_name)
    if payload is None:
        yield None
        return

    resp = http_client.post("/pet", json=payload)
    if resp.status_code not in (200, 201):
        yield None
        return

    data = resp.json()
    pet_id = data.get("id")
    yield pet_id

    if pet_id is not None:
        try:
            http_client.delete(f"/pet/{pet_id}", headers={"api_key": "special-key"})
        except Exception:
            pass