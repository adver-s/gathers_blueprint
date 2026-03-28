from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str | None = None

class CurrentUser(BaseModel):
    sub: str


class AuthSyncBody(BaseModel):
    """POST /auth/sync。表示名は未送信なら ID トークンの name / email から補う。"""

    display_name: str | None = None


class AuthSyncOut(BaseModel):
    user_id: int
    needs_profile_detail: bool