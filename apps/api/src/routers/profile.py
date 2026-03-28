from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.dependencies.auth import get_current_user_id
from src.schemas.profile import MyProfileResponse, UpdateProfileRequest
from src.services.profile_service import get_my_profile, update_profile

router = APIRouter(prefix="/profile")


@router.get("", response_model=MyProfileResponse)
def read_my_profile(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_my_profile(db, user_id)

@router.patch("/", response_model=dict)
def patch_profile(
    body: UpdateProfileRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    update_profile(db, user_id, body)
    return {"message": "ok"}