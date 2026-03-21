from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Cognito
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_REGION: str = "ap-northeast-1"
    COGNITO_JWKS_URL: str | None = None  # Optional override, else built from region+pool_id

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cognito_jwks_url(self) -> str:
        if self.COGNITO_JWKS_URL:
            return self.COGNITO_JWKS_URL
        if not self.COGNITO_USER_POOL_ID:
            raise ValueError("COGNITO_USER_POOL_ID is required for Cognito JWT verification")
        return (
            f"https://cognito-idp.{self.COGNITO_REGION}.amazonaws.com/"
            f"{self.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
        )


settings = Settings()