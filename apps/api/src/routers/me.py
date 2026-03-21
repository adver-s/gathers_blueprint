from fastapi import APIRouter, Depends

from src.dependencies.auth import get_current_user

router = APIRouter()


@router.get("")
def get_me(user: dict = Depends(get_current_user)):
    """ログイン中のユーザー情報を返す。Cognito ID トークン検証必須。"""
    return user
