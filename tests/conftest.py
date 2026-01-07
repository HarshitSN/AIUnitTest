import pytest
import httpx

BASE_URL = "https://petstore.swagger.io/v2"

@pytest.fixture(scope="session")
def http_client() -> httpx.Client:
    """
    Shared HTTP client for tests. Uses httpx with the Petstore base URL.
    """
    with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
        yield client

@pytest.fixture
def unique_pet_name() -> str:
    """
    Provides a unique pet name for test isolation.
    """
    import uuid
    return f"TestPet-{uuid.uuid4()}"