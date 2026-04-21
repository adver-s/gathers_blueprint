from datetime import datetime, timezone

from sqlalchemy import and_, exists, func, or_
from sqlalchemy.orm import Session, joinedload

from src.models.event import Event, EventStatus
from src.models.event_membership import EventMembership, MembershipStatus
from src.models.user import User


def create_event(
    db: Session,
    *,
    owner_user_id: int,
    title: str,
    description: str,
    place: str,
    starts_at,
    capacity: int,
    image_key: str | None,
    mood=None,
    schedule_items=None,
    rule_text: str | None = None,
    restrictions=None,
    location_note: str | None = None,
    reservation_note: str | None = None,
) -> Event:
    event = Event(
        title=title,
        description=description,
        place=place,
        starts_at=starts_at,
        capacity=capacity,
        image_key=image_key,
        status=EventStatus.OPEN,
        owner_user_id=owner_user_id,
        mood=mood.dict() if mood else None,
        schedule_items=[item.dict() for item in schedule_items] if schedule_items else None,
        rule_text=rule_text,
        restrictions=restrictions.dict() if restrictions else None,
        location_note=location_note,
        reservation_note=reservation_note,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_events(
    db: Session,
    *,
    include_closed: bool,
    limit: int,
    offset: int,
) -> list[Event]:
    statuses = [EventStatus.OPEN]
    if include_closed:
        statuses.append(EventStatus.CLOSED)
    return (
        db.query(Event)
        .options(joinedload(Event.owner).joinedload(User.profile))
        .filter(Event.status.in_(statuses))
        .order_by(Event.starts_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def list_events_for_user(
    db: Session,
    *,
    user_id: int,
    include_closed: bool,
    limit: int,
    offset: int,
) -> list[Event]:
    statuses = [EventStatus.OPEN]
    if include_closed:
        statuses.append(EventStatus.CLOSED)
    member_exists = exists().where(
        and_(
            EventMembership.event_id == Event.id,
            EventMembership.user_id == user_id,
            EventMembership.status == MembershipStatus.JOINED,
        )
    )
    return (
        db.query(Event)
        .options(joinedload(Event.owner).joinedload(User.profile))
        .filter(Event.status.in_(statuses))
        .filter(or_(Event.owner_user_id == user_id, member_exists))
        .order_by(Event.starts_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def joined_participants_preview_batch(
    db: Session,
    event_ids: list[int],
    *,
    limit_per_event: int = 4,
) -> dict[int, list[User]]:
    if not event_ids:
        return {}
    rows = (
        db.query(EventMembership)
        .options(joinedload(EventMembership.user).joinedload(User.profile))
        .filter(
            EventMembership.event_id.in_(event_ids),
            EventMembership.status == MembershipStatus.JOINED,
        )
        .order_by(EventMembership.event_id.asc(), EventMembership.joined_at.asc())
        .all()
    )
    out: dict[int, list[User]] = {eid: [] for eid in event_ids}
    for m in rows:
        lst = out[m.event_id]
        if len(lst) < limit_per_event:
            lst.append(m.user)
    return out


def get_event_by_id(db: Session, event_id: int) -> Event | None:
    return db.query(Event).filter(Event.id == event_id).first()


def get_event_with_relations(db: Session, event_id: int) -> Event | None:
    return (
        db.query(Event)
        .options(
            joinedload(Event.owner).joinedload(User.profile),
            joinedload(Event.memberships).joinedload(EventMembership.user).joinedload(
                User.profile
            ),
        )
        .filter(Event.id == event_id)
        .first()
    )


def count_joined_batch(db: Session, event_ids: list[int]) -> dict[int, int]:
    if not event_ids:
        return {}
    rows = (
        db.query(EventMembership.event_id, func.count())
        .filter(
            EventMembership.event_id.in_(event_ids),
            EventMembership.status == MembershipStatus.JOINED,
        )
        .group_by(EventMembership.event_id)
        .all()
    )
    counts = {eid: 0 for eid in event_ids}
    for eid, cnt in rows:
        counts[eid] = cnt
    return counts


def count_joined_for_event(db: Session, event_id: int) -> int:
    return (
        db.query(EventMembership)
        .filter(
            EventMembership.event_id == event_id,
            EventMembership.status == MembershipStatus.JOINED,
        )
        .count()
    )


def get_membership(db: Session, event_id: int, user_id: int) -> EventMembership | None:
    return (
        db.query(EventMembership)
        .filter(
            EventMembership.event_id == event_id,
            EventMembership.user_id == user_id,
        )
        .first()
    )


def insert_membership_joined(db: Session, event_id: int, user_id: int) -> None:
    m = EventMembership(
        event_id=event_id,
        user_id=user_id,
        status=MembershipStatus.JOINED,
    )
    db.add(m)
    db.commit()


def save_membership_rejoin(db: Session, membership: EventMembership) -> None:
    membership.status = MembershipStatus.JOINED
    membership.left_at = None
    db.commit()


def save_membership_leave(db: Session, membership: EventMembership) -> None:
    membership.status = MembershipStatus.LEFT
    membership.left_at = datetime.now(timezone.utc)
    db.commit()


def save_membership_kick(db: Session, membership: EventMembership) -> None:
    membership.status = MembershipStatus.KICKED
    membership.left_at = datetime.now(timezone.utc)
    db.commit()


def save_event(db: Session, event: Event) -> None:
    db.commit()
    db.refresh(event)
