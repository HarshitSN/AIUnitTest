# Tests for the Petstore User API (KAN-4)

This repository contains PyTest-based tests for the Petstore API described by the OpenAPI spec at:
https://petstore.swagger.io/v2/swagger.json

How to run:
- Ensure Python 3.9+ is installed.
- Install dependencies:
  - pip install -r tests/requirements.txt
- Run tests:
  - pytest -q

Notes:
- Tests cover happy paths, validation errors, not-found cases, and basic authentication with the provided api_key header.
- Schemathesis tests are included as an optional property-based test to validate the API against the OpenAPI schema.

Environment variables:
- BASE_URL: Base URL for the API (default: https://petstore.swagger.io/v2)
- OPENAPI_URL: URL to the OpenAPI spec (default: https://petstore.swagger.io/v2/swagger.json)

Conformance:
- Tests are Python 3.9 compatible.
- Tests are self-contained; no conftest.py dependencies beyond the provided fixtures.
- Each test file includes its own necessary imports as required.