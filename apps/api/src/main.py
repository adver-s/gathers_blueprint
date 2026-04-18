import os
from pathlib import Path

from dotenv import load_dotenv

# リポジトリルートではなく apps/api/.env を常に読む（起動 cwd に依存しない）
# override=True: シェルに残った古い COGNITO_* より .env を優先する
_API_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _API_ROOT / ".env"

load_dotenv(_API_ROOT / ".env", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.config.database import engine
from src.routers import auth, events, me, profile

app = FastAPI()

_cors_raw = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:3000,"
    "http://localhost:3000,"
    "http://127.0.0.1:3004,"
    "http://localhost:3004"
)
_cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]
# localhost と 127.0.0.1 は別オリジン。片方だけ .env に書くともう片方からの fetch が CORS で落ちるため補完する。
_pairs = (
    ("http://localhost:3000", "http://127.0.0.1:3000"),
    ("http://localhost:3000/", "http://127.0.0.1:3000"),
    ("http://127.0.0.1:3000", "http://localhost:3000"),
    ("http://localhost:3004", "http://127.0.0.1:3004"),
    ("http://127.0.0.1:3004", "http://localhost:3004"),
)
for a, b in _pairs:
    if a in _cors_origins and b not in _cors_origins:
        _cors_origins.append(b)

# Next の「Network」URL（例: http://192.168.x.x:3000）は allow_origins に無いと
# ブラウザが CORS でレスポンスを破棄し fetch が "Failed to fetch" になる。
# 本番では CORS_ALLOW_LAN_DEV=false か CORS_ORIGIN_REGEX を明示してください。
_cors_origin_regex: str | None = None
_env_regex = os.getenv("CORS_ORIGIN_REGEX", "").strip()
if _env_regex:
    _cors_origin_regex = _env_regex
elif os.getenv("CORS_ALLOW_LAN_DEV", "true").lower() in ("1", "true", "yes"):
    _cors_origin_regex = (
        r"^https?://("
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}|"
        r"100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}"
        r")(:\d{1,5})?$"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello FastAPI"}


@app.get("/health")
def health_check():
    """Health check endpoint that verifies database connection."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"error: {str(e)}"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(me.router, prefix="/me", tags=["me"])
app.include_router(profile.router, prefix="/me/profile", tags=["me"])
app.include_router(events.router, prefix="/events", tags=["events"])