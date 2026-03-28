from datetime import datetime
from enum import IntEnum
from sqlalchemy import Column, String, DateTime, Integer, SmallInteger, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from src.models.user import Base


class EventStatus(IntEnum):
    OPEN = 0
    CLOSED = 1
    CANCELLED = 2


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False, default="")
    image_key = Column(String(255), nullable=True)
    place = Column(String(255), nullable=False)
    starts_at = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(SmallInteger, default=EventStatus.OPEN, nullable=False)

    # Extended event fields (mood / schedule / rule / restrictions)
    mood = Column(JSON, nullable=True)
    schedule_items = Column(JSON, nullable=True)
    rule_text = Column(Text, nullable=True)
    restrictions = Column(JSON, nullable=True)
    location_note = Column(Text, nullable=True)
    reservation_note = Column(Text, nullable=True)

    owner_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="events_owned")
    memberships = relationship("EventMembership", back_populates="event", cascade="all, delete-orphan")
