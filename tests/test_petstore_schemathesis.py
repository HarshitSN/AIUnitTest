import pytest

try:
    import schemathesis
except Exception:
    schemathesis = None  # type: ignore

if schemathesis is not None:
    # Use the official Swagger Petstore OpenAPI (2.0) spec
    schema = schemathesis.from_url("https://petstore.swagger.io/v2/swagger.json")

    @schema.parametrize()
    def test_schema_api(case):
        """Property-based tests generated from the OpenAPI spec using Schemathesis."""
        case.call_and_validate()
else:
    import pytest
    @pytest.mark.skip(reason="Schemathesis not installed; skipping schema-based tests")
    def test_schema_api():
        """Skipped: Schemathesis not installed in the environment."""
        pass