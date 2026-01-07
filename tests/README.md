This repository contains automated API tests derived from the Swagger Petstore OpenAPI spec.

How to run:
- Install dependencies from tests/requirements.txt
- Run pytest from the project root
  pytest

What’s included:
- tests/test_petstore_api.py: Direct HTTP tests for key Petstore endpoints (happy paths, 404 cases, and basic auth edge cases).
- tests/test_schemathesis.py: Schemathesis-based property tests that validate endpoints against the OpenAPI schema.
- tests/conftest.py: Pytest fixtures (HTTP client, API key headers).
- tests/README.md: This document.