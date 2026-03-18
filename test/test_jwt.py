from src.utils.jwt_utils import encode_jwt, verify_jwt

import pytest


def test_encode_jwt():
    payload = {"id": 123, "username": "leifengyang"}
    token = encode_jwt(payload)
    print(f"token: {token}")
    assert token is not None

def test_verify_jwt():
    payload = {"sub": "123", "username": "leifengyang"}
    token = encode_jwt(payload)
    payload2 = verify_jwt(token)
    print(f"payload: {payload2}")
    assert payload2 is not None
    assert payload2["sub"] == "123"
    assert payload2["username"] == "leifengyang"

def test_my_token():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoibGVpZmVuZ3lhbmciLCJlbWFpbCI6ImxmeUBleGFtcGxlLmNvbSIsImV4cCI6MTc3Mzc1NDkyNiwiaWF0IjoxNzczNzUzMTI2fQ.h4haBMTRcL7TntSMNOjGSaMy_sL8ugPmxk3DJYiGlrw"
    payload = verify_jwt(token)
    print(f"payload: {payload}")
    assert payload is not None
    assert payload["sub"] == 2

