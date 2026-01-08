This repository contains Pytest tests for the Pet Store OpenAPI (Swagger) API at https://petstore.swagger.io/v2.

How to run:
- Ensure you have Python 3.9+ installed.
- Install dependencies: pip install -r tests/requirements.txt
- Run tests with pytest: pytest -q

Configuration:
- BASE_URL environment variable can be used to override the API base URL. Default is https://petstore.swagger.io/v2

Test coverage:
- Pet endpoints: happy paths, 404 on missing IDs, and basic validation checks.
- User endpoints: happy paths and validation/404 cases.
- Store endpoints: inventory retrieval and a happy-path order flow.

Notes:
- The tests rely on the public Pet Store API and may be influenced by its current state. They are designed to be idempotent by using unique identifiers where possible.