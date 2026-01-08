# Petstore API Test Suite

This repository contains pytest-based tests for the Swagger Petstore API (OpenAPI v2).

How to run:
- Install dependencies:
  - pytest
  - requests
  - schemathesis
- Run tests:
  - pytest -q

Notes:
- Tests include happy-path flows, validation errors, not-found scenarios, and a Schemathesis-based property test harness that validates all endpoints against the OpenAPI schema.
- Tests use the public Petstore API at https://petstore.swagger.io/v2.