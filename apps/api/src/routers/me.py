from fastapi import APIRouter, Depends
from schemas.auth import CurrentUser

from src.dependencies.auth import get_current_user

router = APIRouter()


@router.get("")
def get_me(user: CurrentUser = Depends(get_current_user)):
    """ログイン中のユーザー情報を返す。Cognito ID トークン検証必須。"""
    return user
