"use client";

import type {
  EventCreatePayload,
  EventDetail,
  EventListItem,
  EventUpdatePayload,
} from "@/types/eventsApi";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getAccessToken } from "@/lib/auth/getAccessToken";
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated (missing Cognito access token).");
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function createEvent(payload: EventCreatePayload): Promise<EventDetail> {
  if (isMockEventsApi()) return mockCreateEvent(payload);

  return apiFetch<EventDetail>("/events", {
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

  return apiFetch<EventListItem[]>(`/events?${qs.toString()}`);
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

  return apiFetch<EventListItem[]>(`/me/events?${qs.toString()}`);
}

export async function fetchEventById(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockFetchEventById(eventId);

  return apiFetch<EventDetail>(`/events/${eventId}`);
}

export async function joinEvent(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockJoinEvent(eventId);

  return apiFetch<EventDetail>(`/events/${eventId}/join`, { method: "POST" });
}

export async function leaveEvent(eventId: number): Promise<EventDetail> {
  if (isMockEventsApi()) return mockLeaveEvent(eventId);

  return apiFetch<EventDetail>(`/events/${eventId}/leave`, { method: "POST" });
}

export async function updateEvent(
  eventId: number,
  payload: EventUpdatePayload,
): Promise<EventDetail> {
  if (isMockEventsApi()) return mockUpdateEvent(eventId, payload);

  // FastAPI uses PATCH /events/{event_id} with EventUpdate schema.
  return apiFetch<EventDetail>(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

