# ユーザープロフィールの型定義

from pydantic import BaseModel
from datetime import date
from typing import Optional


class MyProfileResponse(BaseModel):
    id: int
    name: str
    gender: int
    birth_date: date
    bio: str | None
    image_key: str | None
    profile_detail_completed: bool

class SetupProfileRequest(BaseModel):
    name: str
    gender: int
    birth_date: date
    bio: str | None = None

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    gender: Optional[int] = None
    birth_date: Optional[date] = None
    bio: Optional[str] = None
    image_key: Optional[str] = None