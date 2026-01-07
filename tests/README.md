This repository contains automated API tests for the Swagger Petstore OpenAPI v2 spec (JAN 2024). 

What’s included:
- tests/test_petstore_api.py: direct pytest tests against the live Petstore endpoints.
  - Happy-path tests (create, read, update, upload)
  - Validation/error-path tests (not found, invalid input)
  - Edge cases (concurrency)
  - Authentication tests using the api_key header (special-key)

- tests/test_schemathesis_petstore.py: Schemathesis-based property tests validating the API against the OpenAPI schema.

- tests/conftest.py: shared fixtures for base URL, HTTP session, and test data generation.

How to run:
- Ensure you have network access from the runner.
- Install dependencies from requirements.txt if needed.
- Run: pytest -q

Notes:
- The Petstore API uses an API key for certain endpoints via header api_key: special-key.
- Some endpoints may respond with 200/201 for valid inputs while returning 405/400 for invalid inputs per the spec; tests account for both.