from sqlalchemy.orm import Session
from fastapi import HTTPException

from src.repositories.user_repository import get_user_with_profile
from src.models.user import User
from src.schemas.profile import MyProfileResponse, UpdateProfileRequest


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

def update_profile(
    db: Session,
    user_id: int,
    body: UpdateProfileRequest,
) -> User:
    user = get_user_with_profile(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # users テーブルの更新
    if body.name is not None:
        user.name = body.name
    if body.gender is not None:
        user.gender = body.gender
    if body.birth_date is not None:
        user.birth_date = body.birth_date
    if body.image_key is not None:
        user.image_key = body.image_key

    # profiles テーブルの更新（存在前提）
    if body.bio is not None and user.profile is not None:
        user.profile.bio = body.bio

    db.commit()
    db.refresh(user)
    return user

def is_profile_completed(user: User) -> bool:
    # TODO: 実装予定
    return True