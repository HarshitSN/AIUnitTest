Tests to validate the Swagger Petstore API (KAN-4 - User API Tests) using pytest, requests, and Schemathesis.

How to run:
- Ensure Python 3.9+ is installed.
- Install dependencies: pytest, requests, schemathesis
- Run tests with: pytest -q

Configuration:
- BASE_URL can be overridden with the BASE_URL environment variable. Default is https://petstore.swagger.io/v2
- The tests include an api_key header (special-key) to satisfy endpoints secured via api_key in the OpenAPI spec.

What’s covered:
- Happy path tests for pet creation, retrieval, search by status/tags, and image upload
- Validation/error handling tests for invalid input and not found resources
- Not-found and unauthorized scenarios
- Schemathesis property-based tests validating the OpenAPI schema against the live API

Notes:
- Some endpoints require authentication; tests use HEADERS = {"api_key": "special-key"} to simulate an authenticated call.
- The Schemathesis tests pull the OpenAPI specification from the live URL (https://petstore.swagger.io/v2/swagger.json).

If you need adjustments to endpoints or extra scenarios, I can extend the tests accordingly.