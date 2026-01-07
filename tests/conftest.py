"""
Pytest fixtures for Petstore API tests and helper utilities.
This module is loaded automatically by pytest and provides
shared setup for all test modules.
"""
import uuid
import requests
import pytest

BASE_URL = "https://petstore.swagger.io/v2"

@pytest.fixture(scope="session")
def http_session():
    """
    A reusable HTTP session configured with JSON headers.
    """
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    yield session
    session.close()

@pytest.fixture
def unique_pet_name():
    """
    Generate a unique pet name for test isolation.
    """
    return f"TestPet-{uuid.uuid4()}"

@pytest.fixture
def sample_pet_payload(unique_pet_name):
    """
    Minimal valid Pet payload used to create a new pet.
    Note: The public Petstore requires at least a name and photoUrls.
    """
    return {
        "id": 0,
        "name": unique_pet_name,
        "photoUrls": ["http://example.com/photo.jpg"]
    }

@pytest.fixture
def create_pet(http_session, sample_pet_payload):
    """
    Convenience fixture to create a pet and return the HTTP response.
    """
    resp = http_session.post(f"{BASE_URL}/pet", json=sample_pet_payload, timeout=15)
    return resp