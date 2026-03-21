from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.dependencies.db_user import require_db_user
from src.models.user import User
from src.schemas.event import EventCreate, EventDetailOut, EventListOut, EventUpdate, KickBody
from src.services import event_service as es

router = APIRouter()


@router.post("/", response_model=EventDetailOut)
def create_event(
    body: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_db_user),
):
    return es.create_event(db, user, body)


@router.get("/", response_model=list[EventListOut])
def list_events(
    db: Session = Depends(get_db),
    include_closed: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return es.list_events(db, include_closed=include_closed, limit=limit, offset=offset)


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    return es.get_event_detail(db, event_id)


@router.patch("/{event_id}", response_model=EventDetailOut)
def patch_event(
    event_id: int,
    body: EventUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_db_user),
):
    return es.update_event(db, event_id, user, body)


@router.post("/{event_id}/join", response_model=EventDetailOut)
def join_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_db_user),
):
    return es.join_event(db, event_id, user)


@router.post("/{event_id}/leave", response_model=EventDetailOut)
def leave_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_db_user),
):
    return es.leave_event(db, event_id, user)


@router.post("/{event_id}/kick", response_model=EventDetailOut)
def kick_member(
    event_id: int,
    body: KickBody,
    db: Session = Depends(get_db),
    owner: User = Depends(require_db_user),
):
    return es.kick_member(db, event_id, owner, body.user_id)


@router.post("/{event_id}/close", response_model=EventDetailOut)
def close_event(
    event_id: int,
    db: Session = Depends(get_db),
    owner: User = Depends(require_db_user),
):
    return es.close_event(db, event_id, owner)


@router.post("/{event_id}/cancel", response_model=EventDetailOut)
def cancel_event(
    event_id: int,
    db: Session = Depends(get_db),
    owner: User = Depends(require_db_user),
):
    return es.cancel_event(db, event_id, owner)
