import pytest
import requests
import os
from typing import Optional

BASE_DEFAULT = "https://reqres.in/api"

@pytest.fixture(scope="session")
def api_base_url() -> str:
    """
    Base URL for the API under test.
    Can be overridden with the BASE_URL environment variable.
    """
    return os.environ.get("BASE_URL", BASE_DEFAULT)

@pytest.fixture(scope="session")
def api_session() -> requests.Session:
    """
    Shared HTTP session for re-use across tests.
    """
    session = requests.Session()
    session.headers.update({"Accept": "application/json"})
    return session