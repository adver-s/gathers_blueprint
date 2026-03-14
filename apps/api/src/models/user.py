from datetime import datetime
from sqlalchemy import Column, Integer, String, SmallInteger, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cognito_sub = Column(String(36), unique=True, nullable=False)
    name = Column(String(50), nullable=False, index=True)
    gender = Column(SmallInteger, nullable=False)
    birth_date = Column(Date, nullable=False)
    image_key = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    eventsOwned = relationship("Event", back_populates="owner", cascade="all, delete-orphan")
    memberships = relationship("EventMembership", back_populates="user", cascade="all, delete-orphan")
