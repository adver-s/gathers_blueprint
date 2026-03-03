export type HostProfile = {
  name: string;
  bio: string;
  avatarUrl: string | null;
};

export type CreateEventPayload = {
  title: string;
  coverImageUrl: string | null;
  place: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  capacity: number;
  activityTags: string[];
  atmosphereText: string;
};

export type Event = CreateEventPayload & {
  id: string;
  owner: HostProfile;
  createdAt: string; // ISO
};