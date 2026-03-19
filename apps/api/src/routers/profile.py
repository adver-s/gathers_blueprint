from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.profile_service import get_my_profile
from schemas.profile import MyProfileResponse

router = APIRouter(prefix="/profile") # APIエンドポイントのグループ化 URLの先頭に/profileをつける


@router.get("/me", response_model=MyProfileResponse) # GET /profile/me というAPIを作る
# read_my_profile→APIが呼ばれたときに実行される関数
def read_my_profile(
    user_id: int,  # ここは後で認証dependency
    db: Session = Depends(get_db)
):
    return get_my_profile(db, user_id)