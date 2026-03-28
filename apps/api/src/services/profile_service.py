from sqlalchemy.orm import Session
from fastapi import HTTPException

from src.repositories.user_repository import get_user_with_profile
from src.models.user import User
from src.schemas.profile import MyProfileResponse, SetupProfileRequest


def get_my_profile(db: Session, user_id: int) -> MyProfileResponse | None:

    user = get_user_with_profile(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return MyProfileResponse(
        id=user.id,
        name=user.name,
        gender=user.gender,
        birth_date=user.birth_date,
        bio=user.profile.bio if user.profile else None,
        image_key=user.image_key,
        profile_detail_completed=bool(user.profile_detail_completed),
    )

def update_initial_profile(
    db: Session,
    user_id: int,
    body: SetupProfileRequest,
) -> User:
    user = get_user_with_profile(db, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = body.name
    user.gender = body.gender
    user.birth_date = body.birth_date

    if user.profile:
        user.profile.bio = body.bio

    user.profile_detail_completed = True

    db.commit()
    db.refresh(user)

    return user

def is_profile_completed(user: User) -> bool:
    # TODO: 実装予定
    return True