from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.lib.cognito import CognitoTokenUse, verify_cognito_token

oauth2_scheme = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        claims = verify_cognito_token(
            credentials.credentials,
            token_use=CognitoTokenUse.ID,
        )
    except ValueError:
        raise credentials_exception

    return {
        "sub": claims["sub"],
        "email": claims.get("email", ""),
        "name": claims.get("name", ""),
    }
