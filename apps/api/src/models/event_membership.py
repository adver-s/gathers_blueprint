from datetime import datetime
from enum import IntEnum
from sqlalchemy import Column, Integer, SmallInteger, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from src.models.user import Base


class MembershipStatus(IntEnum):
    JOINED = 1
    LEFT = 2
    KICKED = 3


class EventMembership(Base):
    __tablename__ = "event_memberships"
    __table_args__ = (
        Index("idx_event_memberships_user_id", "user_id"),
    )

    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    status = Column(SmallInteger, default=MembershipStatus.JOINED, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    left_at = Column(DateTime, nullable=True)

    # Relationships
    event = relationship("Event", back_populates="memberships")
    user = relationship("User", back_populates="memberships")
