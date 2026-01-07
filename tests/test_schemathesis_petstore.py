import pytest
import schemathesis
import requests

# Load the OpenAPI/Swagger 2.0 spec from the public Petstore
SCHEMA_URI = "https://petstore.swagger.io/v2/swagger.json"

# Initialize Schemathesis schema (using HTTPX/requests under the hood)
schema = schemathesis.from_uri(SCHEMA_URI)

@pytest.mark.usefixtures("requests")
@schema.parametrize()
def test_schemathesis_case(case) -> None:
    """
    Property-based tests using Schemathesis.
    Each generated case is executed against the live Petstore and validated
    against the OpenAPI schema.
    """
    # Attempt to run the case; fall back to a simple HTTPX session if needed
    try:
        # Most cases can be executed by default call()
        response = case.call()
    except TypeError:
        # Some environments may require explicit session/client
        with requests.Session() as sess:
            response = case.call(session=sess)

    # Validate the response against the OpenAPI schema
    case.validate_response(response)