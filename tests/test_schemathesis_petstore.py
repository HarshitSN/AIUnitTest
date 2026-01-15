import os
import schemathesis
import pytest

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")
SCHEMA_URL = "https://petstore.swagger.io/v2/swagger.json"

# Load the OpenAPI schema from the public Petstore URL
schema = schemathesis.from_url(SCHEMA_URL)

@pytest.mark.parametrize  # marker to keep test discoverable in some envs
@schema.parametrize()
def test_all_endpoints(case):
    """Schemathesis property test: validate all endpoints against the OpenAPI schema.

    This test will generate multiple cases for all endpoints defined in the schema
    and call them against the provided BASE_URL. It validates responses against the
    schema automatically.
    """
    case.call_and_validate(base_url=BASE_URL)