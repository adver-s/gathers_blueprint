from sqlalchemy.orm import Session, joinedload
from models.user import User
from models.profile import Profile

def get_user_with_profile(db: Session, user_id: int) -> User | None:
    return (
        db.query(User) # 検索するテーブルを指定
        .options(joinedload(User.profile)) # profileテーブルも同一クエリで取得
        .filter(User.id == user_id) # id指定で検索
        .first() # 最初の一件を取得(なければNone)
    )

def get_user_by_cognito_sub(db: Session, cognito_sub: str) -> User | None:
    return (
        db.query(User)
        .filter(User.cognito_sub == cognito_sub)
        .first()
    )

def create_user_with_profile(db: Session, cognito_sub: str) -> User:
    user = User(
        cognito_sub=cognito_sub,
        name="",
        gender=0,
        birth_date="2000-01-01",
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