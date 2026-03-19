from sqlalchemy.orm import Session, joinedload
from models.user import User

def get_user_with_profile(db: Session, user_id: int) -> User | None:
    return (
        db.query(User) # 検索するテーブルを指定
        .options(joinedload(User.profile)) # profileテーブルも同一クエリで取得
        .filter(User.id == user_id) # id指定で検索
        .first() # 最初の一件を取得
    )