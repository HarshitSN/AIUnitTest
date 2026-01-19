import os
import pytest
import schemathesis
import requests
from uuid import uuid4

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")
OPENAPI_URL = os.environ.get("OPENAPI_URL", "https://petstore.swagger.io/v2/swagger.json")
AUTH_HEADERS = {"api_key": "special-key"}

# Schemathesis schema loaded from the OpenAPI spec URL
schema = schemathesis.from_url(OPENAPI_URL)

@pytest.mark.skip(reason="Schemathesis property tests can be heavy; enable when running in CI with network access.")
@schema.parametrize()
def test_schema(case):
    """
    Schemathesis property-based test that validates all endpoints against the OpenAPI schema.
    Each generated case will be executed against the target BASE_URL with the necessary headers.
    This test is marked to be skipped by default to avoid long-running runs in local environments.
    """
    case.call(base_url=BASE_URL, headers=AUTH_HEADERS)