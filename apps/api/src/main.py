from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from sqlalchemy import text

from src.config.database import init_db, engine
from src.routers import auth, me

app = FastAPI()


@app.on_event("startup")
def startup():
    init_db()


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