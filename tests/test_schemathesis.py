import os
import requests
import pytest
import schemathesis

BASE_URL = os.environ.get("BASE_URL", "https://petstore.swagger.io/v2")
SCHEMA_URL = "https://petstore.swagger.io/v2/swagger.json"

schema = schemathesis.from_url(SCHEMA_URL)

HEADERS = {"api_key": "special-key"}

@pytest.mark.parametrize("case", schema.endpoints["/pet/{petId}"].get_cases("GET"))
def test_schemathesis_pet_by_id_get(case):
    """Property test: GET /pet/{petId} against the schema."""
    response = case.call(requests, base_url=BASE_URL, headers=HEADERS)
    case.validate_response(response)

@pytest.mark.parametrize("case", schema.endpoints["/pet"].get_cases("POST"))
def test_schemathesis_pet_post(case):
    """Property test: POST /pet against the schema."""
    response = case.call(requests, base_url=BASE_URL, headers=HEADERS)
    case.validate_response(response)

@pytest.mark.parametrize("case", schema.endpoints["/pet/findByStatus"].get_cases("GET"))
def test_schemathesis_find_by_status(case):
    """Property test: GET /pet/findByStatus against the schema."""
    response = case.call(requests, base_url=BASE_URL, headers=HEADERS)
    case.validate_response(response)

@pytest.mark.parametrize("case", schema.endpoints["/pet/findByTags"].get_cases("GET"))
def test_schemathesis_find_by_tags(case):
    """Property test: GET /pet/findByTags against the schema."""
    response = case.call(requests, base_url=BASE_URL, headers=HEADERS)
    case.validate_response(response)

@pytest.mark.parametrize("case", schema.endpoints["/pet/{petId}"].get_cases("PUT"))
def test_schemathesis_put_pet(case):
    """Property test: PUT /pet/{petId} against the schema."""
    response = case.call(requests, base_url=BASE_URL, headers=HEADERS)
    case.validate_response(response)