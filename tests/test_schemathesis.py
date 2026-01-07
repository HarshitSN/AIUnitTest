"""
Schemathesis-based property tests for the Swagger Petstore API.

This test harness loads the OpenAPI v2 spec from the public Petstore
and generates property-based tests for all endpoints. Each generated
case performs a live HTTP request against the remote API and validates
the response against the schema.

Note: Running this test may produce a large number of generated cases.
It uses the built-in Schemathesis `@schema.parametrize()` decorator
to emit pytest test cases automatically.
"""
import schemathesis
import pytest

# Load the OpenAPI/Swagger specification from the public Petstore endpoint.
SCHEMA_URI = "https://petstore.swagger.io/v2/swagger.json"

schema = schemathesis.from_uri(SCHEMA_URI)

@pytest.mark.usefixtures("pytest_configure")  # no-op fixture to ensure pytest recognizes parameterization
@schema.parametrize()
def test_api(case):
    """
    Property-based test: Execute a generated case against the Petstore API
    and validate that the response conforms to the OpenAPI schema.

    - case.call(base_url): performs the HTTP request for this case.
    - case.validate_response(response): validates the HTTP response against the spec.
    """
    # Attempt to perform the request using the base URL of the Petstore service.
    # Some endpoints require an API key (api_key: special-key); the test harness
    # relies on the spec defaults. If the server denies, Schemathesis will report
    # a validation error; this is still valuable for schema coverage.
    response = case.call(base_url="https://petstore.swagger.io/v2")
    # Validate that the actual HTTP response matches the OpenAPI schema for this operation.
    case.validate_response(response)