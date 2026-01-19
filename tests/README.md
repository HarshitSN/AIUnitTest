# Petstore API Tests
This directory contains pytest tests for the Swagger Petstore API (OpenAPI 2.0).

How to run:
- Install dependencies from tests/requirements.txt
- Run: pytest -q

Environment:
- BASE_URL can override the API base URL. Default uses https://petstore.swagger.io/v2

Tests:
- tests/test_petstore_api.py: Happy path, 404, validation, and auth edge cases.
- tests/test_schemathesis.py: Schemathesis-based property tests against the OpenAPI schema.