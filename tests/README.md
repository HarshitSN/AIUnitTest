This repository contains PyTest-based API tests for the Swagger Petstore OpenAPI v2 spec.

How tests are organized:
- tests/test_petstore_api.py
  - Manual, deterministic tests for core Pet endpoints (POST /pet, GET /pet/{petId}, etc.)
  - Covers happy paths, not-found cases, authentication edge checks, and form data uploads.

- tests/test_schemathesis_petstore.py
  - Schemathesis-based property tests that validate endpoints against the OpenAPI schema.
  - Generates tests from the OpenAPI spec and validates responses.

- tests/conftest.py
  - Common fixtures like http_session and BASE_URL.

How to run:
- Ensure Python 3.9+ environment with required dependencies.
- Install requirements: pip install -r tests/requirements.txt
- Run tests: pytest -q

Note:
- The Petstore API is publicly hosted; tests rely on network access to https://petstore.swagger.io/v2
- Tests include happy paths, validation errors, not-found checks, and basic auth-key edge scenarios.