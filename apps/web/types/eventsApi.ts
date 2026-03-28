export type EventStatus = "OPEN" | "CLOSED" | "CANCELLED";

export type EventOwnerBrief = {
  user_id: number;
  name: string;
  image_key: string | null;
};

export type ParticipantOut = {
  user_id: number;
  name: string;
  bio: string | null;
  image_key: string | null;
};

// 元のイベント案に合わせて拡張枠（現状 FastAPI は未実装のため optional）
export type EventMood = {
  firstMeet: number;
  casual: number;
  active: number;
  calm: number;
  indoor: number;
  outdoor: number;
};

export type EventScheduleItem = {
  id: string;
  title: string;
  minutes?: number | null;
};

export type EventRestrictions = {
  ageRange?: string | null;
  scale?: string | null;
  capacityText?: string | null;
  level?: string | null;
};

export type EventDetail = {
  id: number;
  title: string;
  description: string;
  place: string;
  starts_at: string; // ISO
  capacity: number;
  joined_count: number;
  status: EventStatus;
  image_key: string | null;
  owner: EventOwnerBrief;
  participants: ParticipantOut[];

  // Extension fields (optional)
  mood?: EventMood | null;
  scheduleItems?: EventScheduleItem[] | null;
  ruleText?: string | null;
  restrictions?: EventRestrictions | null;
  locationNote?: string | null;
  reservationNote?: string | null;
};

export type EventListItem = {
  id: number;
  title: string;
  place: string;
  starts_at: string; // ISO
  capacity: number;
  joined_count: number;
  status: EventStatus;
  image_key: string | null;
  owner: EventOwnerBrief;

  // Optional preview fields for nicer list cards
  participants_preview?: ParticipantOut[] | null;
};

export type EventUpdatePayload = {
  title?: string | null;
  description?: string | null;
  place?: string | null;
  starts_at?: string | null; // ISO datetime
  capacity?: number | null;
  image_key?: string | null;

  // Extension fields (optional; if backend supports them later)
  mood?: EventMood | null;
  scheduleItems?: EventScheduleItem[] | null;
  ruleText?: string | null;
  restrictions?: EventRestrictions | null;
  locationNote?: string | null;
  reservationNote?: string | null;
};

