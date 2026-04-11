from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.repositories.user_repository import get_user_id_by_cognito_sub
from src.lib.cognito import CognitoTokenUse, verify_cognito_token
from src.schemas.auth import CurrentUser

oauth2_scheme = HTTPBearer(auto_error=True)


def get_id_token_claims(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> dict:
    """POST /auth/sync 専用。Cognito ID トークンを検証し claims を返す。"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        return verify_cognito_token(
            credentials.credentials,
            token_use=CognitoTokenUse.ID,
        )
    except ValueError:
        raise credentials_exception from None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # フロントの getAccessToken() と一致させる（/auth/sync のみ ID トークン）。
        claims = verify_cognito_token(
            credentials.credentials,
            token_use=CognitoTokenUse.ACCESS,
        )
    except ValueError:
        raise credentials_exception

    return CurrentUser(
        sub=claims["sub"]
    )

def get_current_user_id(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> int:
    user_id = get_user_id_by_cognito_sub(db, current_user.sub)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user_id