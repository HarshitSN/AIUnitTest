# Tests for the Petstore API (Swagger/OpenAPI)

This project contains pytest-based tests for the Petstore API described in the OpenAPI/Swagger specification.

How to run
- Install dependencies:
  - pip install -r tests/requirements.txt
- Run tests:
  - pytest -q

Notes
- The tests use the public Petstore endpoint at https://petstore.swagger.io/v2
- Schemathesis is used to exercise property tests against the OpenAPI spec
- Tests include happy-path coverage, validation errors, not-found cases, and basic edge handling