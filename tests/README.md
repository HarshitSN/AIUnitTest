This repository contains pytest-based API tests generated from the OpenAPI spec of the Swagger Petstore.

How to run
- Ensure Python 3.9+ and required packages are installed.
- Install test dependencies:
  - pytest
  - httpx
  - schemathesis

- Run tests:
  - pytest -q

Notes
- The tests target the publicly available Petstore API: https://petstore.swagger.io/v2/swagger.json
- Tests cover happy paths, validation errors, 404 not found, basic auth scenarios (when applicable), and property-based checks via Schemathesis.
- A minimal fixture-based approach is used to create and cleanup test data where possible.