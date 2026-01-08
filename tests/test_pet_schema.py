import pytest
import schemathesis

# Use the public Swagger Petstore OpenAPI (Swagger/OpenAPI v2) spec
SCHEMA_URL = "https://petstore.swagger.io/v2/swagger.json"

schema = schemathesis.from_uri(SCHEMA_URL)


@schema.parametrize()
def test_api(case) -> None:
    """
    Schemathesis property-based test harness.
    Iterates over all valid cases defined in the OpenAPI spec and validates
    that the endpoint responses conform to the schema.
    """
    case.call_and_validate()
