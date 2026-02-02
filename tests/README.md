# API Tests for User Management Service (ReqRes OpenAPI-based)

This repository contains pytest-based tests for the ReqRes User API endpoints:
- GET /users (list with pagination)
- GET /users/{id} (single user)
- POST /users (create user)
- PUT /users/{id} (update user)
- DELETE /users/{id} (delete user)

How to run
- Ensure Python 3.9+ is installed
- Install test dependencies:
  - pytest
  - requests
- Run tests with:
  - pytest -q

Environment
- BASE_URL environment variable can override the API base URL. Default: https://reqres.in/api

Notes
- Tests leverage a shared base URL via tests/conftest.py and pytest fixtures.
- Some tests create and delete temporary users to validate lifecycle behavior.