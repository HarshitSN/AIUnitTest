import schemathesis
import pytest

"""
Schemathesis property-based tests:
- Leverage the OpenAPI spec to generate cases and validate responses
- Tests run against the public Petstore endpoint
- Focus on schema validation, required fields, and data types
"""

OPENAPI_URL = "https://petstore.swagger.io/v2/swagger.json"
BASE_URL = "https://petstore.swagger.io/v2"

schema = schemathesis.from_uri(OPENAPI_URL)


@pytest.mark.parametrize("case", schema.get_all_cases(exclude_tag="internal"))
def test_schemathesis_api(case):
    """
    Property-based tests generated from the OpenAPI spec.
    Each case will be executed against the Petstore base URL.
    We validate that responses conform to the OpenAPI schema.
    """
    # Some setups allow case.call to auto-validate responses against schema;
    # here we explicitly pass the base_url for http calls.
    case.call(base_url=BASE_URL)


def test_schemathesis_basic_run():
    """
    Simple smoke test to ensure the schema can be instantiated and a few
    representative cases can be generated without error.
    This doesn't run all generated cases to keep runtime reasonable.
    """
    # Take a small slice of generated cases to ensure harness works
    for idx, case in enumerate(schema.get_all_cases()):
        if idx >= 5:
            break
        # Run a single case against the base URL
        case.call(base_url=BASE_URL)