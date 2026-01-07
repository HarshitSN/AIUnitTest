import os
from typing import Optional

import pytest

"""
Test configuration and fixtures for KAN-4: User API Tests
Base URL defaults to the Swagger Petstore public instance.
"""

BASE_DEFAULT_URL: str = "https://petstore.swagger.io/v2"


@pytest.fixture(scope="session")
def base_url() -> str:
    """
    Base URL for the Petstore API under test.
    Can be overridden with the PETSTORE_BASE_URL environment variable.
    """
    return os.environ.get("PETSTORE_BASE_URL", BASE_DEFAULT_URL)


@pytest.fixture
def pet_payload() -> Optional[dict]:
    """
    Provide a valid Pet payload for create/update tests.
    Returns Optional[dict] to demonstrate typing with Optional.
    """
    import uuid

    pet_id = uuid.uuid4().int & (2**31 - 1)
    payload: dict = {
        "id": int(pet_id),
        "name": f"TestPet-{pet_id}",
        "status": "available",
        "photoUrls": ["http://example.com/photo.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag"}],
    }
    return payload