import pytest
import httpx
from typing import Dict

# Base URL for the Swagger Petstore OpenAPI v2
BASE_URL: str = "https://petstore.swagger.io/v2"

@pytest.fixture(scope="session")
def http_client() -> httpx.Client:
    """
    Shared HTTP client for all tests.
    """
    with httpx.Client(timeout=20.0) as client:
        yield client

@pytest.fixture
def api_key_headers() -> Dict[str, str]:
    """
    Headers to satisfy the API key security requirement for endpoints that require auth.
    Uses the standard 'api_key' header with the value 'special-key' as described in the spec.
    """
    return {"api_key": "special-key"}