import pytest
import schemathesis

# Use the public Petstore OpenAPI v2 JSON for Schemathesis property tests
SCHEMA_URL = "https://petstore.swagger.io/v2/swagger.json"

schema = schemathesis.from_uri(SCHEMA_URL)

@pytest.mark.parametrize("case", schema.get_cases("GET", "/pet/findByStatus"))
def test_schemathesis_find_by_status(case):
    """Schemathesis property test: validate GET /pet/findByStatus against the schema."""
    case.call_and_validate(headers={"api_key": "special-key"})

@pytest.mark.parametrize("case", schema.get_cases("POST", "/pet"))
def test_schemathesis_add_pet(case):
    """Schemathesis property test: validate POST /pet against the schema with proper headers."""
    case.call_and_validate(headers={"api_key": "special-key"})