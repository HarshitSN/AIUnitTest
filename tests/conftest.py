import os
import pytest
import requests
from uuid import uuid4

# Base URL for the Petstore API. Can be overridden with BASE_URL env var.
BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")


@pytest.fixture
def base_url():
    """Base URL fixture for API under test."""
    return BASE_URL.rstrip("/")


@pytest.fixture
def auth_headers():
    """
    Authorization headers for endpoints that require an API key.
    The Swagger Petstore example uses the header name 'api_key' with the value 'special-key'.
    """
    return {"api_key": "special-key"}


@pytest.fixture
def unique_pet_id():
    """
    Generate a reasonably unique integer ID for test pets to avoid collisions.
    """
    return abs(uuid4().int % 1_000_000_000)