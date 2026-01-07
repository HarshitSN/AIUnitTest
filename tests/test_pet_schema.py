import schemathesis
import pytest

# Property-based tests generated from the OpenAPI spec.
# This harness validates that the live API conforms to the schema for a wide range
# of inputs and combinations.

# Load the OpenAPI/Swagger specification from the official Petstore
schema = schemathesis.from_uri("https://petstore.swagger.io/v2/swagger.json")

@pytest.mark.parametrize("case", schema.get_all_cases())
def test_api_case(case):
    """
    Property test: Run a large set of generated cases against the live API and validate
    that responses conform to the OpenAPI schema.
    """
    # The case.call_and_validate() method will perform the HTTP call and validate
    # the response against the OpenAPI schema for that operation.
    case.call_and_validate()