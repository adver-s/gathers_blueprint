import os
from pathlib import Path

from dotenv import load_dotenv

# リポジトリルートではなく apps/api/.env を常に読む（起動 cwd に依存しない）
# override=True: シェルに残った古い COGNITO_* より .env を優先する
_API_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _API_ROOT / ".env"

print("ENV FILE PATH:", _ENV_FILE)
print("EXISTS:", _ENV_FILE.exists())

load_dotenv(_API_ROOT / ".env", override=True)

print("DATABASE_URL after load_dotenv:", os.getenv("DATABASE_URL"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.config.database import engine
from src.routers import auth, events, me, profile

app = FastAPI()

_cors_raw = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:3000,http://localhost:3000,"
    "http://127.0.0.1:3004,http://localhost:3004",
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
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