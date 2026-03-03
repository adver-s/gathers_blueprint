from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.models.user import Base


class EventStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class Event(Base):
    __tablename__ = "Event"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    imageUrl = Column(String, nullable=True)
    place = Column(String, nullable=False)
    startsAt = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(SQLEnum(EventStatus), default=EventStatus.OPEN, nullable=False)
    ownerUserId = Column(String, ForeignKey("User.id", ondelete="RESTRICT"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="eventsOwned", foreign_keys=[ownerUserId])
    memberships = relationship("EventMembership", back_populates="event", cascade="all, delete-orphan")
