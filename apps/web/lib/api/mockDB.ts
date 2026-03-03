import type { Event } from "@/types/event";

const KEY = "gathers_mock_events_v1";

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function loadEvents(): Event[] {
  if (typeof window === "undefined") return [];
  const data = safeParse<Event[]>(localStorage.getItem(KEY));
  return Array.isArray(data) ? data : [];
}

export function saveEvents(events: Event[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function upsertEvent(e: Event) {
  const events = loadEvents();
  const idx = events.findIndex((x) => x.id === e.id);
  if (idx >= 0) events[idx] = e;
  else events.unshift(e);
  saveEvents(events);
}

export function findEventById(id: string): Event | null {
  const events = loadEvents();
  return events.find((e) => e.id === id) ?? null;
}