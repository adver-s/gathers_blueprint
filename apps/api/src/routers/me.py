from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from src.models.user import User
from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.dependencies.db_user import get_optional_db_user
from src.repositories.user_repository import create_user_with_profile
from src.services.profile_service import is_profile_completed
from src.schemas.me import MeResponse
from src.schemas.auth import CurrentUser

router = APIRouter()


@router.get("", response_model=MeResponse)
def get_me(
    db_user: User | None = Depends(get_optional_db_user),
):
    if db_user is None:
        return {
            "is_authenticated": True,
            "needs_signup": True,
            "is_profile_completed": None,
            "user_id": None,
        }

    return {
        "is_authenticated": True,
        "needs_signup": False,
        "is_profile_completed": is_profile_completed(db_user),
        "user_id": db_user.id,
    }

@router.post("/setup", response_model=MeResponse)
def setup_me(
    db: Session = Depends(get_db),
    db_user: User | None = Depends(get_optional_db_user),
    current_user: CurrentUser = Depends(get_current_user),
):
    if db_user:
        return {
            "is_authenticated": True,
            "needs_signup": False,
            "is_profile_completed": is_profile_completed(db_user),
            "user_id": db_user.id,
        }

    db_user = create_user_with_profile(
        db,
        cognito_sub=current_user.sub,
        name="",
        gender=0,
        birth_date=date(2000, 1, 1),
        bio=None,
    )

    return {
        "is_authenticated": True,
        "needs_signup": False,
        "is_profile_completed": False,
        "user_id": db_user.id,
    }