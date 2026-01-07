import pytest
import requests
import random

# Base URL for the Swagger Petstore OpenAPI v2
BASE_URL = "https://petstore.swagger.io/v2"

@pytest.fixture(scope="session")
def http_session():
    """
    Shared HTTP session for all tests to reuse connections.
    """
    session = requests.Session()
    yield session
    session.close()

@pytest.fixture
def unique_pet_id():
    """
    Generate a reasonably unique pet ID for test isolation.
    """
    return random.randint(1_000_000, 9_999_999)