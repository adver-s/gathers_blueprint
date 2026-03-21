from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from services.profile_service import (
    get_my_profile,
    create_user_if_not_exists,
    update_initial_profile,
)
from schemas.profile import MyProfileResponse, SetupProfileRequest

# 後で補完
def get_current_user_id():
    return 1
def get_current_user_sub():
    return "dummy-sub"


router = APIRouter(prefix="/profile") # APIエンドポイントのグループ化 URLの先頭に/profileをつける


@router.get("/me", response_model=MyProfileResponse) # GET /profile/me というAPIを作る
# read_my_profile→APIが呼ばれたときに実行される関数
def read_my_profile(
    user_id: int,  # ここは後で認証dependency
    db: Session = Depends(get_db)
):
    return get_my_profile(db, user_id)

@router.post("/init")
def init_user(
    db: Session = Depends(get_db),
    cognito_sub: str = Depends(get_current_user_sub),
):
    user = create_user_if_not_exists(db, cognito_sub)

    return {"user_id": user.id}

@router.post("/init")
def init_user(
    db: Session = Depends(get_db),
    cognito_sub: str = Depends(get_current_user_sub),
):
    user = create_user_if_not_exists(db, cognito_sub)

    return {"user_id": user.id}