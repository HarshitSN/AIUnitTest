import json
import uuid
from typing import Optional

import requests
import pytest

"""
Tests for creating a new Pet via POST /pet.

- Happy path: valid payload leads to 200/201 on the public Petstore
- Validation error: missing required fields should yield 400/405 where applicable
- Edge case: invalid payload should yield 400/405
"""

def create_pet_payload() -> Optional[dict]:
    """
    Build a valid Pet payload for creation.
    Demonstrates Optional[dict] return type in a helper.
    """
    pet_id = uuid.uuid4().int & (2**31 - 1)
    payload = {
        "id": int(pet_id),
        "name": f"TestPet-{pet_id}",
        "status": "available",
        "photoUrls": ["http://example.com/photo.jpg"],
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag"}],
    }
    return payload


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_add_pet_happy(base_url, monkeypatch):
    """Happy path: Add a new pet with a valid payload."""
    payload = create_pet_payload()
    resp = requests.post(f"{base_url}/pet", json=payload, timeout=10)
    assert resp.status_code in (200, 201), f"Unexpected status: {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict)
    assert "id" in data
    assert "name" in data


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_add_pet_validation_error(base_url):
    """Validation error: submit invalid payload (missing required fields)."""
    payload = {
        "id": int(uuid.uuid4().int & (2**31 - 1)),
        "status": "available",
        "category": {"id": 0, "name": "string"},
        "tags": [{"id": 0, "name": "tag"}],
    }
    resp = requests.post(f"{base_url}/pet", json=payload, timeout=10)
    assert resp.status_code in (400, 405)


@pytest.mark.parametrize("base_url", ["https://petstore.swagger.io/v2"], indirect=True)
def test_add_pet_edge_case(base_url):
    """Edge case: submit an invalid payload (missing all fields)."""
    payload = {}
    resp = requests.post(f"{base_url}/pet", json=payload, timeout=10)
    assert resp.status_code in (400, 405), f"Unexpected status: {resp.status_code}"
