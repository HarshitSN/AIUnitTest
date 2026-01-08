import pytest
import requests
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

# The tests use fixtures from conftest.py
# api_base_url: str
# api_session: requests.Session

def test_get_users_schema_validation(api_base_url: str, api_session: requests.Session) -> None:
    """Validate response schema for listing users: ensure keys and types exist."""
    resp = api_session.get(f"{api_base_url}/users", params={"page": 2})
    assert resp.status_code == 200
    payload: Dict[str, Any] = resp.json()
    assert "data" in payload and isinstance(payload["data"], list)
    if payload["data"]:
        user: Dict[str, Any] = payload["data"][0]
        required_keys = {"id", "email", "first_name", "last_name", "avatar"}
        assert isinstance(user, dict)
        assert required_keys.issubset(set(user.keys()))
        assert isinstance(user["id"], int)
        assert isinstance(user["email"], str) and ("@" in user["email"])

def test_concurrent_get_users_pages(api_base_url: str, api_session: requests.Session) -> None:
    """Edge case: perform multiple concurrent GET requests to verify stability under concurrency."""
    url = f"{api_base_url}/users"
    params_list = [{"page": 2}, {"page": 2}, {"page": 2}, {"page": 2}, {"page": 2}]
    results = []

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(api_session.get, url, params=params) for params in params_list]
        for future in as_completed(futures):
            resp = future.result()
            results.append(resp)

    for r in results:
        assert r.status_code == 200
        data = r.json()
        assert "data" in data
        assert isinstance(data["data"], list)