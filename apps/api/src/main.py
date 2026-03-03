from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from src.config.database import init_db, get_db_session, SessionLocal

app = FastAPI()

# Initialize database tables on startup
@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Hello FastAPI"}

@app.get("/health")
def health_check(db: Session = Depends(get_db_session)):
    """Health check endpoint that verifies database connection."""
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"error: {str(e)}"}
