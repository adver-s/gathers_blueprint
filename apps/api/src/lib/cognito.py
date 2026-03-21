"""
Cognito JWT 検証モジュール。

Cognito が発行した ID トークン / アクセストークンを JWKS で検証する。
"""

from enum import Enum

import jwt
from jwt import PyJWKClient, PyJWKClientError
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from src.config.settings import settings


class CognitoTokenUse(str, Enum):
    ID = "id"
    ACCESS = "access"


def _get_jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.cognito_jwks_url)


_jwks_client: PyJWKClient | None = None


def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = _get_jwks_client()
    return _jwks_client


def verify_cognito_token(
    token: str,
    token_use: CognitoTokenUse = CognitoTokenUse.ID,
) -> dict:
    """
    Cognito 発行の JWT を検証し、ペイロードを返す。

    Args:
        token: Bearer トークン文字列
        token_use: 受け入れるトークン種別 (id または access)

    Returns:
        検証済みの claims (sub, email など)

    Raises:
        ValueError: トークンが無効な場合
    """
    issuer = (
        f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
        f"{settings.COGNITO_USER_POOL_ID}"
    )

    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)
    except PyJWKClientError as e:
        raise ValueError("Could not retrieve signing key") from e
    except InvalidTokenError as e:
        raise ValueError("Invalid token") from e

    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={
                "verify_aud": False,
                "verify_signature": True,
                "verify_exp": True,
                "verify_iss": True,
                "require": ["token_use", "exp", "iss", "sub"],
            },
        )
    except ExpiredSignatureError as e:
        raise ValueError("Token expired") from e
    except InvalidTokenError as e:
        raise ValueError("Invalid token") from e

    if claims.get("token_use") != token_use.value:
        raise ValueError(f"Invalid token_use: expected {token_use.value}")

    if token_use == CognitoTokenUse.ID:
        if claims.get("aud") != settings.COGNITO_CLIENT_ID:
            raise ValueError("Invalid audience")
    else:
        if claims.get("client_id") != settings.COGNITO_CLIENT_ID:
            raise ValueError("Invalid client_id")

    return claims
