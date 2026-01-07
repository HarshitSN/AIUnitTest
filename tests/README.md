This directory contains pytest-based tests for the KAN-4 Epic: User API Tests.
How to run:
- Install dependencies from tests/requirements.txt
- Run: pytest -q

Notes:
- OpenAPI-driven property testing is implemented via Schemathesis.
- Tests cover happy paths, 404s for missing resources, and basic authentication scenarios.
- Tests are designed to be robust against minor variations in future API server behavior.