import pytest
import requests
import time
import os

# Base URL for the Petstore OpenAPI v2 (Swagger Petstore)
BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture
def session():
    """Provides a reusable HTTP session for tests."""
    s = requests.Session()
    yield s
    s.close()

@pytest.fixture
def base_url():
    """Base URL fixture for API endpoints."""
    return BASE_URL

@pytest.fixture
def new_pet_payload():
    """Generates a unique minimal Pet payload for creation tests."""
    t = int(time.time() * 1000)
    return {"id": t, "name": f"TestPet-{t}", "photoUrls": ["http://example.com/photo.jpg"]}