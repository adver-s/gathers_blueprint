import type { CreateEventPayload, Event, HostProfile } from "@/types/event";
import { findEventById, upsertEvent } from "./mockDB";

function uid() {
  // 軽いユニークID（十分）
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function createEventMock(
  payload: CreateEventPayload,
  owner: HostProfile
): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 700));

  const e: Event = {
    ...payload,
    id: uid(),
    owner,
    createdAt: new Date().toISOString(),
  };

  upsertEvent(e);
  return { id: e.id };
}

export async function getEventMock(id: string): Promise<Event | null> {
  await new Promise((r) => setTimeout(r, 250));
  return findEventById(id);
}