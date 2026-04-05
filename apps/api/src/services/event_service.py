from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.event import Event, EventStatus
from src.models.event_membership import MembershipStatus
from src.models.user import User
from src.repositories import event_repository as er
from src.schemas.event import (
    EventCreate,
    EventDetailOut,
    EventListOut,
    EventOwnerBrief,
    EventStatusStr,
    EventUpdate,
    ParticipantOut,
)


def _status_str(value: int) -> EventStatusStr:
    return EventStatusStr(EventStatus(value).name)


def _owner_brief(user: User) -> EventOwnerBrief:
    return EventOwnerBrief(
        user_id=user.id,
        name=user.name,
        image_key=user.image_key,
    )


def _participant_out(user: User) -> ParticipantOut:
    bio = user.profile.bio if user.profile else None
    return ParticipantOut(
        user_id=user.id,
        name=user.name,
        bio=bio,
        image_key=user.image_key,
    )


def create_event(db: Session, owner_id: int, body: EventCreate) -> EventDetailOut:
    event = er.create_event(
        db,
        owner_user_id=owner_id,
        title=body.title,
        description=body.description,
        place=body.place,
        starts_at=body.starts_at,
        capacity=body.capacity,
        image_key=body.image_key,
        mood=body.mood,
        schedule_items=body.scheduleItems,
        rule_text=body.ruleText,
        restrictions=body.restrictions,
        location_note=body.locationNote,
        reservation_note=body.reservationNote,
    )
    full = er.get_event_with_relations(db, event.id)
    assert full is not None
    return event_to_detail(db, full)


def list_events(
    db: Session,
    *,
    include_closed: bool,
    limit: int,
    offset: int,
) -> list[EventListOut]:
    events = er.list_events(db, include_closed=include_closed, limit=limit, offset=offset)
    ids = [e.id for e in events]
    counts = er.count_joined_batch(db, ids)
    return [event_to_list_out(e, counts.get(e.id, 0)) for e in events]


def list_my_events(
    db: Session,
    *,
    user_id: int,
    include_closed: bool,
    limit: int,
    offset: int,
) -> list[EventListOut]:
    events = er.list_events_for_user(
        db,
        user_id=user_id,
        include_closed=include_closed,
        limit=limit,
        offset=offset,
    )
    ids = [e.id for e in events]
    counts = er.count_joined_batch(db, ids)
    preview_users = er.joined_participants_preview_batch(db, ids)
    out: list[EventListOut] = []
    for e in events:
        users = preview_users.get(e.id, [])
        preview = [_participant_out(u) for u in users] if users else None
        out.append(
            event_to_list_out(
                e,
                counts.get(e.id, 0),
                participants_preview=preview,
            )
        )
    return out


def get_event_detail(db: Session, event_id: int) -> EventDetailOut:
    event = er.get_event_with_relations(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event_to_detail(db, event)


def event_to_list_out(
    event: Event,
    joined_count: int,
    *,
    participants_preview: list[ParticipantOut] | None = None,
) -> EventListOut:
    return EventListOut(
        id=event.id,
        title=event.title,
        place=event.place,
        starts_at=event.starts_at,
        capacity=event.capacity,
        joined_count=joined_count,
        status=_status_str(event.status),
        image_key=event.image_key,
        owner=_owner_brief(event.owner),
        participants_preview=participants_preview,
    )


def event_to_detail(db: Session, event: Event) -> EventDetailOut:
    joined_count = er.count_joined_for_event(db, event.id)
    participants: list[ParticipantOut] = []
    for m in event.memberships:
        if m.status != MembershipStatus.JOINED:
            continue
        participants.append(_participant_out(m.user))
    return EventDetailOut(
        id=event.id,
        title=event.title,
        description=event.description,
        place=event.place,
        starts_at=event.starts_at,
        capacity=event.capacity,
        joined_count=joined_count,
        status=_status_str(event.status),
        image_key=event.image_key,
        owner=_owner_brief(event.owner),
        participants=participants,
        mood=event.mood,
        scheduleItems=event.schedule_items,
        ruleText=event.rule_text,
        restrictions=event.restrictions,
        locationNote=event.location_note,
        reservationNote=event.reservation_note,
    )


def update_event(db: Session, event_id: int, actor_id: int, body: EventUpdate) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.owner_user_id != actor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the event owner")

    if event.status != EventStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event is not open for updates",
        )

    if body.title is not None:
        event.title = body.title
    if body.description is not None:
        event.description = body.description
    if body.place is not None:
        event.place = body.place
    if body.starts_at is not None:
        event.starts_at = body.starts_at
    if body.capacity is not None:
        joined = er.count_joined_for_event(db, event_id)
        if body.capacity < joined:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Capacity cannot be less than current joined count",
            )
        event.capacity = body.capacity
    if body.image_key is not None:
        event.image_key = body.image_key
    if body.mood is not None:
        event.mood = body.mood
    if body.scheduleItems is not None:
        event.schedule_items = body.scheduleItems
    if body.ruleText is not None:
        event.rule_text = body.ruleText
    if body.restrictions is not None:
        event.restrictions = body.restrictions
    if body.locationNote is not None:
        event.location_note = body.locationNote
    if body.reservationNote is not None:
        event.reservation_note = body.reservationNote

    er.save_event(db, event)

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)


def join_event(db: Session, event_id: int, user_id: int) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.status != EventStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Recruitment is not open",
        )

    if user_id == event.owner_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner does not join via this endpoint",
        )

    joined = er.count_joined_for_event(db, event_id)
    membership = er.get_membership(db, event_id, user_id)

    if membership is None:
        if joined >= event.capacity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event is full")
        er.insert_membership_joined(db, event_id, user_id)

    elif membership.status == MembershipStatus.JOINED:
        pass

    elif membership.status == MembershipStatus.LEFT:
        if joined >= event.capacity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event is full")
        er.save_membership_rejoin(db, membership)

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot rejoin after being removed",
        )

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)


def leave_event(db: Session, event_id: int, user_id: int) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if user_id == event.owner_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner has no membership row to leave",
        )

    membership = er.get_membership(db, event_id, user_id)
    if membership is None or membership.status != MembershipStatus.JOINED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not an active participant",
        )

    er.save_membership_leave(db, membership)

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)


def kick_member(db: Session, event_id: int, owner_id: int, target_user_id: int) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.owner_user_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the event owner")

    if target_user_id == event.owner_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the owner",
        )

    membership = er.get_membership(db, event_id, target_user_id)
    if membership is None or membership.status != MembershipStatus.JOINED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not an active participant",
        )

    er.save_membership_kick(db, membership)

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)


def close_event(db: Session, event_id: int, owner_id: int) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.owner_user_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the event owner")

    if event.status != EventStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event is not open",
        )

    event.status = EventStatus.CLOSED
    er.save_event(db, event)

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)


def cancel_event(db: Session, event_id: int, owner_id: int) -> EventDetailOut:
    event = er.get_event_by_id(db, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.owner_user_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the event owner")

    if event.status == EventStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event is already cancelled",
        )

    event.status = EventStatus.CANCELLED
    er.save_event(db, event)

    full = er.get_event_with_relations(db, event_id)
    assert full is not None
    return event_to_detail(db, full)