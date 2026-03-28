from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from models.user import User
from config.database import get_db
from dependencies.auth import get_current_user
from dependencies.db_user import get_optional_db_user
from repositories.user_repository import create_user_with_profile
from services.profile_service import is_profile_completed
from schemas.me import MeResponse
from src.schemas.auth import CurrentUser

router = APIRouter()


@router.get("")
def get_me(user: CurrentUser = Depends(get_current_user)):
    """ログイン中のユーザー情報を返す。Cognito ID トークン検証必須。"""
    return user
