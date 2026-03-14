from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db, SessionLocal
from src.routers import me

app = FastAPI()

app.include_router(me.router)

@app.get("/")
def root():
    return {"message": "Hello FastAPI"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Halth check endpoint that verifies database connection."""
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"error: {str(e)}"}
