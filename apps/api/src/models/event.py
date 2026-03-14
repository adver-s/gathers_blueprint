from datetime import datetime
from enum import IntEnum
from sqlalchemy import Column, String, DateTime, Integer, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from src.models.user import Base


class EventStatus(IntEnum):
    OPEN = 1
    CLOSED = 2
    CANCELLED = 3


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    image_key = Column(String(255), nullable=True)
    place = Column(String(255), nullable=False)
    starts_at = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(SmallInteger, default=EventStatus.OPEN, nullable=False)
    owner_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="events_owned")
    memberships = relationship("EventMembership", back_populates="event", cascade="all, delete-orphan")
