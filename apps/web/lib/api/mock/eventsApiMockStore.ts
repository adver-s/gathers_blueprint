import type { EventDetail, EventListItem, EventUpdatePayload } from "@/types/eventsApi";
import {
  MOCK_MY_USER_ID,
  detailToListItem,
  getMockMyProfile,
  getSeedDetails,
} from "@/lib/api/mock/eventsApiSeed";

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function mockDelay(ms = 120) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

let store: Map<number, EventDetail> | null = null;

function ensureStore(): Map<number, EventDetail> {
  if (!store) {
    store = new Map();
    for (const d of getSeedDetails()) {
      store.set(d.id, deepClone(d));
    }
  }
  return store;
}

export async function mockFetchEvents(opts?: {
  includeClosed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<EventListItem[]> {
  await mockDelay(150);
  const includeClosed = opts?.includeClosed ?? false;
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  const map = ensureStore();
  let rows = [...map.values()];
  if (!includeClosed) {
    rows = rows.filter((d) => d.status === "OPEN");
  }
  rows.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return rows.slice(offset, offset + limit).map(detailToListItem);
}

export async function mockFetchEventById(eventId: number): Promise<EventDetail> {
  await mockDelay(100);
  const d = ensureStore().get(eventId);
  if (!d) throw new Error(`イベントが見つかりません (mock id=${eventId})`);
  return deepClone(d);
}

const meParticipant = () => {
  const p = getMockMyProfile();
  return {
    user_id: p.id,
    name: p.name,
    bio: p.bio,
    image_key: p.image_key,
  };
};

export async function mockJoinEvent(eventId: number): Promise<EventDetail> {
  await mockDelay(200);
  const map = ensureStore();
  const cur = map.get(eventId);
  if (!cur) throw new Error(`イベントが見つかりません (mock id=${eventId})`);
  if (cur.owner.user_id === MOCK_MY_USER_ID) return deepClone(cur);
  if (cur.joined_count >= cur.capacity) return deepClone(cur);

  const already = cur.participants.some((p) => p.user_id === MOCK_MY_USER_ID);
  if (!already) {
    cur.participants = [...cur.participants, meParticipant()];
    cur.joined_count = cur.joined_count + 1;
  }
  return deepClone(cur);
}

export async function mockLeaveEvent(eventId: number): Promise<EventDetail> {
  await mockDelay(200);
  const map = ensureStore();
  const cur = map.get(eventId);
  if (!cur) throw new Error(`イベントが見つかりません (mock id=${eventId})`);

  const had = cur.participants.some((p) => p.user_id === MOCK_MY_USER_ID);
  if (had) {
    cur.participants = cur.participants.filter((p) => p.user_id !== MOCK_MY_USER_ID);
    cur.joined_count = Math.max(0, cur.joined_count - 1);
  }
  return deepClone(cur);
}

export async function mockUpdateEvent(
  eventId: number,
  payload: EventUpdatePayload,
): Promise<EventDetail> {
  await mockDelay(180);
  const map = ensureStore();
  const cur = map.get(eventId);
  if (!cur) throw new Error(`イベントが見つかりません (mock id=${eventId})`);

  const assign = <K extends keyof EventDetail>(key: K, v: EventDetail[K] | null | undefined) => {
    if (v !== undefined && v !== null) (cur as EventDetail)[key] = v as EventDetail[K];
  };

  if (payload.title !== undefined && payload.title !== null) cur.title = payload.title;
  if (payload.description !== undefined && payload.description !== null)
    cur.description = payload.description;
  if (payload.place !== undefined && payload.place !== null) cur.place = payload.place;
  if (payload.starts_at !== undefined && payload.starts_at !== null) cur.starts_at = payload.starts_at;
  if (payload.capacity !== undefined && payload.capacity !== null) cur.capacity = payload.capacity;
  if (payload.image_key !== undefined) cur.image_key = payload.image_key;
  assign("mood", payload.mood ?? undefined);
  assign("scheduleItems", payload.scheduleItems ?? undefined);
  assign("ruleText", payload.ruleText ?? undefined);
  assign("restrictions", payload.restrictions ?? undefined);
  assign("locationNote", payload.locationNote ?? undefined);
  assign("reservationNote", payload.reservationNote ?? undefined);

  return deepClone(cur);
}
