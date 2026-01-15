Run instructions for API tests using pytest and Schemathesis.

Prerequisites:
- Python 3.9+
- Install test dependencies: pip install -r tests/requirements.txt

How to run:
- Run all tests locally against the Petstore API (public endpoint):
  export BASE_URL="https://petstore.swagger.io/v2" (optional; defaults to this value)
  pytest -q

Notes:
- The tests include happy-path flows, 404/not-found checks, and Schemathesis-based property tests against the OpenAPI spec at https://petstore.swagger.io/v2/swagger.json
- Some endpoints require an API key (api_key: special-key). Tests supply this header where applicable.