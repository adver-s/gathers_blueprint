from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from src.models.user import Base


class MembershipStatus(str, Enum):
    JOINED = "JOINED"
    LEFT = "LEFT"
    KICKED = "KICKED"


class EventMembership(Base):
    __tablename__ = "EventMembership"
    __table_args__ = (
        UniqueConstraint("eventId", "userId", name="EventMembership_eventId_userId_key"),
        Index("EventMembership_userId_idx", "userId"),
        Index("EventMembership_eventId_idx", "eventId"),
    )

    id = Column(String, primary_key=True)
    eventId = Column(String, ForeignKey("Event.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(MembershipStatus), default=MembershipStatus.JOINED, nullable=False)
    joinedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    leftAt = Column(DateTime, nullable=True)

    # Relationships
    event = relationship("Event", back_populates="memberships", foreign_keys=[eventId])
    user = relationship("User", back_populates="memberships", foreign_keys=[userId])
