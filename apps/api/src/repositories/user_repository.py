from sqlalchemy.orm import Session, joinedload

from src.models.profile import Profile
from src.models.user import User
from datetime import date

def get_user_with_profile(db: Session, user_id: int) -> User | None:
    return (
        db.query(User) # 検索するテーブルを指定
        .options(joinedload(User.profile)) # profileテーブルも同一クエリで取得
        .filter(User.id == user_id) # id指定で検索
        .first() # 最初の一件を取得(なければNone)
    )

def get_user_id_by_cognito_sub(db: Session, cognito_sub: str) -> int | None:
    result = (
        db.query(User.id)
        .filter(User.cognito_sub == cognito_sub)
        .first()
    )
    return result[0] if result else None

def get_user_by_cognito_sub(db: Session, cognito_sub: str) -> User | None:
    return (
        db.query(User)
        .filter(User.cognito_sub == cognito_sub)
        .first()
    )

def create_user_with_profile(
    db: Session,
    *,
    cognito_sub: str,
    name: str,
    gender: int,
    birth_date: date,
    bio: str | None,
) -> User:
    user = User(
        cognito_sub=cognito_sub,
        name=name,
        gender=gender,
        birth_date=birth_date,
    )
    db.add(user)

    profile = Profile(
        user=user,
        bio=bio,
    )
    db.add(profile)

    db.commit()
    db.refresh(user)
    return user