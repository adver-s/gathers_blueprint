from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.repositories.user_repository import get_user_by_cognito_sub, get_user_id_by_cognito_sub
from schemas.auth import CurrentUser

# ↓ユーザーが存在しない場合も許容
def get_optional_db_user(
    db: Session = Depends(get_db),
    claims: CurrentUser = Depends(get_current_user),
) -> User | None:
    return get_user_by_cognito_sub(db, claims.sub)

# ↓ユーザーが必ず存在する前提のAPI用（存在しなければ404エラー）
def require_db_user(
    db: Session = Depends(get_db),
    claims: CurrentUser = Depends(get_current_user),
) -> User:
    user = get_user_by_cognito_sub(db, claims["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

def require_db_user_id(
    db: Session = Depends(get_db),
    claims: CurrentUser = Depends(get_current_user),
) -> int:
    user_id = get_user_id_by_cognito_sub(db, claims["sub"])
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user_id