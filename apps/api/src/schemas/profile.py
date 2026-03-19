# ユーザープロフィールの型定義

from pydantic import BaseModel
from datetime import date


class MyProfileResponse(BaseModel):
    id: int
    name: str
    gender: int
    birth_date: date
    bio: str | None
    image_key: str | None