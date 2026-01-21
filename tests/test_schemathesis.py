import pytest
import schemathesis

# Property-based tests generated from the OpenAPI spec URL
schema = schemathesis.from_url("https://petstore.swagger.io/v2/swagger.json")


@schema.parametrize()
def test_api(case):
    """
    Schemathesis property-based test:
    - Validates that endpoints conform to the OpenAPI schema.
    - Executes each generated example and asserts no schema violations.
    """
    case.call_and_validate()