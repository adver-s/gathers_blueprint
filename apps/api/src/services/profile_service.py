from sqlalchemy.orm import Session
from schemas.profile import MyProfileResponse
from repositories.user_repository import get_user_with_profile


def get_my_profile(db: Session, user_id: int) -> MyProfileResponse | None:

    user = get_user_with_profile(db, user_id)

    if user is None:
        return None

    return MyProfileResponse(
        id=user.id,
        name=user.name,
        gender=user.gender,
        birth_date=user.birth_date,
        bio=user.profile.bio if user.profile else None,
        image_key=user.image_key,
    )