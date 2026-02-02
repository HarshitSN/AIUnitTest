import pytest
import requests
import os
from uuid import uuid4

"""
Tests for creating users (POST /users) and basic response validation.

Scenarios:
- Happy path: create a user and verify the response contains id, createdAt, and echoed fields.
- Schema validation: verify data types of the response fields.
"""

def test_create_user_success(base_url, session, unique_payload):
    """Happy path: Create a new user with valid data and validate response."""
    resp = session.post(f"{base_url}/users", json=unique_payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
    data = resp.json()
    assert data.get("name") == unique_payload["name"]
    assert data.get("job") == unique_payload["job"]
    assert "id" in data
    assert "createdAt" in data

def test_create_user_schema_validation(base_url, session, unique_payload):
    """Validate the response schema for a created user (types and presence)."""
    resp = session.post(f"{base_url}/users", json=unique_payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
    data = resp.json()

    # Accept id as int or string depending on server behavior
    assert "id" in data
    assert isinstance(data.get("createdAt"), str)

    # Echoed fields must match the request payload
    assert data.get("name") == unique_payload["name"]
    assert data.get("job") == unique_payload["job"]