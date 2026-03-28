from __future__ import annotations

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

    # Extended fields
    mood: EventMood | None = None
    scheduleItems: list[EventScheduleItem] | None = None
    ruleText: str | None = Field(default=None, max_length=2000)
    restrictions: EventRestrictions | None = None
    locationNote: str | None = Field(default=None, max_length=2000)
    reservationNote: str | None = Field(default=None, max_length=2000)


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    place: str | None = Field(default=None, max_length=255)
    starts_at: datetime | None = None
    capacity: int | None = Field(default=None, ge=1)
    image_key: str | None = Field(default=None, max_length=255)

    # Extended fields
    mood: EventMood | None = None
    scheduleItems: list[EventScheduleItem] | None = None
    ruleText: str | None = Field(default=None, max_length=2000)
    restrictions: EventRestrictions | None = None
    locationNote: str | None = Field(default=None, max_length=2000)
    reservationNote: str | None = Field(default=None, max_length=2000)


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

    # Extended fields
    mood: EventMood | None = None
    scheduleItems: list[EventScheduleItem] | None = None
    ruleText: str | None = Field(default=None, max_length=2000)
    restrictions: EventRestrictions | None = None
    locationNote: str | None = Field(default=None, max_length=2000)
    reservationNote: str | None = Field(default=None, max_length=2000)


class EventMood(BaseModel):
    firstMeet: int
    casual: int
    active: int
    calm: int
    indoor: int
    outdoor: int


class EventScheduleItem(BaseModel):
    id: str
    title: str
    minutes: int | None = None


class EventRestrictions(BaseModel):
    ageRange: str | None = None
    scale: str | None = None
    capacityText: str | None = None
    level: str | None = None


class KickBody(BaseModel):
    user_id: int = Field(..., description="Target member user id")
