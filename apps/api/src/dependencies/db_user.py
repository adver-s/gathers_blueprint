from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.repositories.user_repository import get_user_by_cognito_sub


def require_db_user(
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user),
) -> User:
    user = get_user_by_cognito_sub(db, claims["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
