import pytest
import requests
import os
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")

@pytest.fixture
def session():
    """HTTP session for STORE API tests."""
    s = requests.Session()
    yield s
    s.close()

def test_get_inventory_success(session):
    """Happy path: retrieve inventory snapshot as a dictionary."""
    resp = session.get(f"{BASE_URL}/store/inventory")
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert isinstance(data, dict)

def test_place_order_success(session):
    """Happy path: create a pet and place an order for it."""
    # Create a pet to obtain a valid petId
    pet_payload = {"name": f"OrderPet-{uuid4()}", "photoUrls": ["http://example.com/photo.jpg"]}
    resp_pet = session.post(f"{BASE_URL}/pet", json=pet_payload)
    assert resp_pet.status_code in (200, 201)
    pet_id = resp_pet.json().get("id")
    assert pet_id is not None

    order_payload = {
        "id": 0,
        "petId": pet_id,
        "quantity": 1,
        "shipDate": "2020-01-01T00:00:00.000Z",
        "status": "placed",
        "complete": False
    }
    resp_order = session.post(f"{BASE_URL}/store/order", json=order_payload)
    assert resp_order.status_code in (200, 201)
    data = resp_order.json()
    assert data["petId"] == pet_id