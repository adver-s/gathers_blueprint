from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.models.user import User
from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.dependencies.db_user import get_optional_db_user, require_db_user_id
from src.repositories.user_repository import create_user_with_profile
from src.schemas.auth import CurrentUser
from src.schemas.event import EventListOut
from src.schemas.me import MeResponse
from src.services import event_service as event_svc
from src.services.profile_service import is_profile_completed

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


@router.get("/events", response_model=list[EventListOut])
def list_my_events(
    db: Session = Depends(get_db),
    user_id: int = Depends(require_db_user_id),
    include_closed: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Events the user organizes (owner) or has joined (active membership), by starts_at ascending."""
    return event_svc.list_my_events(
        db,
        user_id=user_id,
        include_closed=include_closed,
        limit=limit,
        offset=offset,
    )


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