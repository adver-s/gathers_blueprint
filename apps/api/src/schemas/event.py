from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class EventStatusStr(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class EventCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: str = Field(default="", max_length=2000)
    place: str = Field(..., max_length=255)
    starts_at: datetime
    capacity: int = Field(..., ge=1)
    image_key: str | None = Field(default=None, max_length=255)


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    place: str | None = Field(default=None, max_length=255)
    starts_at: datetime | None = None
    capacity: int | None = Field(default=None, ge=1)
    image_key: str | None = Field(default=None, max_length=255)


class EventOwnerBrief(BaseModel):
    user_id: int
    name: str
    image_key: str | None


class ParticipantOut(BaseModel):
    user_id: int
    name: str
    bio: str | None
    image_key: str | None


class EventListOut(BaseModel):
    id: int
    title: str
    place: str
    starts_at: datetime
    capacity: int
    joined_count: int
    status: EventStatusStr
    image_key: str | None
    owner: EventOwnerBrief


class EventDetailOut(BaseModel):
    id: int
    title: str
    description: str
    place: str
    starts_at: datetime
    capacity: int
    joined_count: int
    status: EventStatusStr
    image_key: str | None
    owner: EventOwnerBrief
    participants: list[ParticipantOut]


class KickBody(BaseModel):
    user_id: int = Field(..., description="Target member user id")
