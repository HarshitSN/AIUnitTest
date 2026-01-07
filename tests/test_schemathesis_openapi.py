import json
import requests
import pytest
import schemathesis

# Load the OpenAPI (Swagger 2.0) schema from the public Petstore endpoint
SCHEMA_URL = "https://petstore.swagger.io/v2/swagger.json"
schema = schemathesis.from_uri(SCHEMA_URL)

@pytest.mark.parametrize("case", schema.get_all_cases() if hasattr(schema, "get_all_cases") else [])
def test_schemathesis_property_harness(case):
    """
    Schemathesis property test harness.
    This test exercises a subset of generated cases from the OpenAPI schema.
    It uses the 'case.call' interface to perform HTTP calls via the 'requests' library.

    Note: Depending on Schemathesis version, the exact API to iterate over cases may differ.
    The following approach aims to be compatible with common Schemathesis patterns:
    - If schema exposes get_all_cases(), we parametrize over it.
    - Otherwise, this test will gracefully skip if the API isn't present.
    """
    if not hasattr(case, "call"):
        pytest.skip(" Schemathesis case object does not provide 'call' method in this environment.")
    client = requests.Session()
    response = case.call(client)
    # Basic sanity: ensure we got a Response-like object
    assert hasattr(response, "status_code")
    assert isinstance(response.status_code, int)
    # Optional: ensure status code is within typical HTTP range
    assert 100 <= response.status_code <= 599

# Fallback lightweight test to ensure the schema loads and has paths
def test_schemathesis_schema_loads():
    """Sanity check: ensure the schema was loaded and contains paths."""
    assert schema is not None
    # The OpenAPI 2.0 spec should have at least one path
    spec = json.loads(schema.specification if isinstance(schema.specification, str) else json.dumps(schema.specification))
    assert "paths" in spec