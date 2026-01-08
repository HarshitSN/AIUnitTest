API Tests for User Management Service using ReqRes Mock API

How to run
- Ensure Python 3.9+ is installed
- Install dependencies (pytest, requests)
  - pip install -r tests/requirements.txt
- Run tests from project root
  - pytest -q

Environment
- BASE_URL environment variable can override the target base URL (default: https://reqres.in/api)

Notes
- Tests cover happy paths, 404s for non-existent resources, response schema checks, and basic concurrency sanity.
- You can override BASE_URL for local testing or CI environments if needed.