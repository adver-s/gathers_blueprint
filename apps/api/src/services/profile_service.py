from sqlalchemy.orm import Session
from fastapi import HTTPException

from schemas.profile import MyProfileResponse, SetupProfileRequest
from repositories.user_repository import (
    get_user_with_profile,
    get_user_by_cognito_sub,
    create_user_with_profile,
)
from models.user import User


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
    )

def create_user_if_not_exists(db: Session, cognito_sub: str) -> User:
    user = get_user_by_cognito_sub(db, cognito_sub)

    if user:
        return user

    return create_user_with_profile(db, cognito_sub)

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

    db.commit()
    db.refresh(user)

    return user