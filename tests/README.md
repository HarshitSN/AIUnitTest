# Tests for the Swagger Petstore API

This repository contains pytest-based tests for the Petstore API defined by the OpenAPI spec:
https://petstore.swagger.io/v2/swagger.json

How to run
- Install dependencies:
  - pip install -r tests/requirements.txt
- Run tests with pytest:
  - pytest -q

Notes
- The tests exercise happy paths, 404 for missing IDs, and basic schema validation.
- A Schemathesis-based property test harness validates endpoints against the OpenAPI schema.