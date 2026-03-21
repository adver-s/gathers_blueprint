from fastapi import APIRouter

from src.config.setting import settings

router = APIRouter()


@router.get("/config")
def get_auth_config():
    """フロントエンド用 Cognito 設定（Amplify 初期化などで使用）"""
    return {
        "userPoolId": settings.COGNITO_USER_POOL_ID,
        "clientId": settings.COGNITO_CLIENT_ID,
        "region": settings.COGNITO_REGION,
    }
