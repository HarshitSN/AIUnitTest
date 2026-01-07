Welcome to the Petstore API tests.

How to run:
- Ensure Python 3.9+ is installed.
- Install dependencies:
  pip install -r tests/requirements.txt

- Run tests with pytest:
  pytest -q

Notes:
- The tests target the public Swagger Petstore at https://petstore.swagger.io/v2/swagger.json
- Includes:
  - Direct API tests (happy paths, 404s, validation)
  - Schemathesis-based property tests that validate all endpoints against the OpenAPI schema
  - Fixtures for setup/teardown and unique data generation
- Tests are designed to be resilient to some non-deterministic data in the public API (e.g., empty result sets).