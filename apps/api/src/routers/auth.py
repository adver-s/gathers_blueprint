from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.setting import settings
from src.dependencies.auth import get_id_token_claims
from src.schemas.auth import AuthSyncBody, AuthSyncOut
from src.services.auth_sync_service import sync_user_from_cognito

router = APIRouter()


def _cognito_config_error_message() -> str | None:
    """プレースホルダや空のときはメッセージを返す（本物の ID と区別しやすくする）。"""
    pid = (settings.COGNITO_USER_POOL_ID or "").strip()
    cid = (settings.COGNITO_CLIENT_ID or "").strip()
    if not pid:
        return "COGNITO_USER_POOL_ID が空です。apps/api/.env を確認し、uvicorn を再起動してください。"
    if not cid:
        return "COGNITO_CLIENT_ID が空です。apps/api/.env を確認し、uvicorn を再起動してください。"
    if len(cid) >= 8 and all(c == "x" or c == "X" for c in cid):
        return (
            "COGNITO_CLIENT_ID がプレースホルダ (x...) のままです（ディスク上の apps/api/.env）。"
            " エディタで本物の ID に直しただけでは不十分なので、必ずファイルを保存（⌘S）してから uvicorn を再起動してください。"
            " AWS Cognito → ユーザープール → アプリケーションの統合 → アプリクライアント の「クライアント ID」をコピーして貼り付けます。"
        )
    if "_" in pid:
        suffix = pid.split("_", 1)[1]
        if len(suffix) >= 4 and suffix.replace("x", "").replace("X", "") == "":
            return (
                "COGNITO_USER_POOL_ID がプレースホルダのままです。"
                " コンソールのユーザープール ID（例: ap-northeast-1_AbCdEfGh）を .env に設定してください。"
            )
    return None


@router.get("/config")
def get_auth_config():
    """フロントエンド用 Cognito 設定（Amplify 初期化などで使用）"""
    msg = _cognito_config_error_message()
    if msg:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=msg,
        )
    return {
        "userPoolId": settings.COGNITO_USER_POOL_ID.strip(),
        "clientId": settings.COGNITO_CLIENT_ID.strip(),
        "region": settings.COGNITO_REGION,
    }


@router.post("/sync", response_model=AuthSyncOut)
def auth_sync(
    body: AuthSyncBody,
    claims: dict = Depends(get_id_token_claims),
    db: Session = Depends(get_db),
):
    """Cognito ID トークンで DB ユーザーを作成または更新する（idempotent）。"""
    return sync_user_from_cognito(db, claims=claims, display_name=body.display_name)
