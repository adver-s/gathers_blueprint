from sqlalchemy.orm import Session, joinedload

from src.models.profile import Profile
from src.models.user import User

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
    cognito_sub: str,
    *,
    initial_name: str = "",
) -> User:
    name = (initial_name or "").strip() or "ユーザー"
    if len(name) > 50:
        name = name[:50]
    user = User(
        cognito_sub=cognito_sub,
        name=name,
        gender=0,
        birth_date="2000-01-01",
        profile_detail_completed=False,
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        bio="",
    )
    db.add(profile)

    db.commit()
    db.refresh(user)

    return user