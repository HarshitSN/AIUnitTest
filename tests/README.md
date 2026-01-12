# Petstore API Tests

How to run:
- Ensure Python 3.9+ is available
- Install dependencies (see requirements.txt)
- Run tests with pytest

Environment:
- BASE_URL: Optional. Override the API base URL. Default: https://petstore.swagger.io/v2

Notes:
- The tests cover happy paths, not-found cases, basic validation checks, and a basic schema-driven test via Schemathesis if installed.
- Tests use real endpoints from the public Swagger Petstore. Results may vary if the remote API state changes.