from src.utils.password_utils import hash_password, verify_password

import pytest


def test_hash_password():
    plain_password = "123456"
    # 即使同一个字符串，每次加密都不一样，防止彩虹表攻击
    # 以前 md5 会被彩虹表攻击； 字符串一样。md5 摘要后的结果也一样
    hashed_password = hash_password(plain_password)
    print(f"加密后的密码: {hashed_password}")
    assert hashed_password is not None


def test_verify_password():
    plain_password = "123456"
    hashed_password = hash_password(plain_password)


    assert verify_password(plain_password, hashed_password) is True