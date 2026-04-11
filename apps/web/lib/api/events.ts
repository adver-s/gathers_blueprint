"use client";

import type {
  EventCreatePayload,
  EventDetail,
  EventListItem,
  EventUpdatePayload,
} from "@/types/eventsApi";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import {
  mockCreateEvent,
  mockFetchEventById,
  mockFetchEvents,
  mockFetchMyScheduleEvents,
  mockJoinEvent,
  mockLeaveEvent,
  mockUpdateEvent,
} from "@/lib/api/mock/eventsApiMockStore";
import { fetchWithAuth } from "./client";

export async function createEvent(payload: EventCreatePayload): Promise<EventDetail> {
  if (isMockEventsApi()) return mockCreateEvent(payload);

  return fetchWithAuth<EventDetail>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEvents(opts?: {
  includeClosed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<EventListItem[]> {
  if (isMockEventsApi()) return mockFetchEvents(opts);

  const includeClosed = opts?.includeClosed ?? false;
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  const qs = new URLSearchParams({
    include_closed: String(includeClosed),
    limit: String(limit),
    offset: String(offset),
  });

  return fetchWithAuth<EventListItem[]>(`/events?${qs.toString()}`);
}

export async function fetchMyScheduleEvents(opts?: {
  includeClosed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<EventListItem[]> {
  if (isMockEventsApi()) return mockFetchMyScheduleEvents(opts);

  const includeClosed = opts?.includeClosed ?? false;
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  const qs = new URLSearchParams({
    include_closed: String(includeClosed),
    limit: String(limit),
    offset: String(offset),
  });

  return fetchWithAuth<EventListItem[]>(`/me/events?${qs.toString()}`);
}

export async function fetchEventById(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockFetchEventById(eventId);

  return fetchWithAuth<EventDetail>(`/events/${eventId}`);
}

export async function joinEvent(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockJoinEvent(eventId);

  return fetchWithAuth<EventDetail>(`/events/${eventId}/join`, { method: "POST" });
}

export async function leaveEvent(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockLeaveEvent(eventId);

  return fetchWithAuth<EventDetail>(`/events/${eventId}/leave`, { method: "POST" });
}

export async function updateEvent(
  eventId: number,
  payload: EventUpdatePayload,
): Promise<EventDetail> {
  if (isMockEventsApi()) return mockUpdateEvent(eventId, payload);

  // FastAPI uses PATCH /events/{event_id} with EventUpdate schema.
  return fetchWithAuth<EventDetail>(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

