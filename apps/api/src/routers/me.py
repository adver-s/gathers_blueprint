from fastapi import APIRouter, Depends
from src.schemas.auth import CurrentUser

from src.dependencies.auth import get_current_user

router = APIRouter()


@router.get("")
def get_me(user: CurrentUser = Depends(get_current_user)):
    """Cognito の sub を返す。Bearer はアクセストークン（Amplify と揃える）。"""
    return user
