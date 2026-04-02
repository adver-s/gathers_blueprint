from datetime import date

from sqlalchemy.orm import Session

from src.repositories.user_repository import (
    create_user_with_profile,
    get_user_by_cognito_sub,
)
from src.schemas.auth import AuthSyncOut


def _resolve_display_name(claims: dict, display_name: str | None) -> str:
    if display_name and display_name.strip():
        return display_name.strip()[:50]
    name = (claims.get("name") or "").strip()
    if name:
        return name[:50]
    email = claims.get("email")
    if email and isinstance(email, str) and "@" in email:
        return email.split("@")[0][:50]
    return "ユーザー"


def sync_user_from_cognito(
    db: Session,
    *,
    claims: dict,
    display_name: str | None,
) -> AuthSyncOut:
    sub = claims["sub"]
    resolved = _resolve_display_name(claims, display_name)

    user = get_user_by_cognito_sub(db, sub)
    if user is None:
        user = create_user_with_profile(
            db,
            cognito_sub=sub,
            name=resolved,
            gender=0,
            birth_date=date(2000, 1, 1),
            bio=None,
        )
    else:
        if display_name and display_name.strip():
            user.name = display_name.strip()[:50]
        db.commit()
        db.refresh(user)

    return AuthSyncOut(
        user_id=user.id,
        needs_profile_detail=not bool(user.profile_detail_completed),
    )
