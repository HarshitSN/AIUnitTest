# Tests for KAN-4: User API Tests

This repository contains pytest-based tests for the Swagger Petstore API (OpenAPI v2).

How to run
- Ensure Python 3.9+ is available
- Install dependencies:
  - pip install -r tests/requirements.txt
- Run tests:
  - pytest -q

Environment
- BASE_URL environment variable can override the API base URL. Default is https://petstore.swagger.io/v2

Notes
- Tests cover happy paths, 404s, validation errors, and basic authentication flow using the api_key header (special-key).
- Schemathesis tests validate the OpenAPI schema against the live API.

Good luck!