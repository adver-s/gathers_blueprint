"use client";

import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getMockMyProfile } from "@/lib/api/mock/eventsApiSeed";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { fetchWithAuth } from "./client";

export type MyProfile = {
  id: number;
  name: string;
  gender: number;
  birth_date: string;
  bio: string | null;
  image_key: string | null;
  profile_detail_completed: boolean;
};

export type SetupProfileBody = {
  name: string;
  gender: number;
  birth_date: string;
  bio?: string | null;
};

export type UpdateProfileBody = {
  name?: string;
  gender?: number;
  birth_date?: string;
  bio?: string | null;
  image_key?: string | null;
};

export async function fetchMyProfile(): Promise<MyProfile> {
  if (isMockEventsApi()) {
    await new Promise((r) => setTimeout(r, 80));
    return getMockMyProfile();
  }

  return fetchWithAuth<MyProfile>("/me/profile");
}

export async function setupMyProfile(body: SetupProfileBody): Promise<void> {
  if (isMockEventsApi()) {
    await new Promise((r) => setTimeout(r, 120));
    return;
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated (missing Cognito access token).");

  const res = await fetch(`${getApiBaseUrl()}/me/profile/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: body.name,
      gender: body.gender,
      birth_date: body.birth_date,
      bio: body.bio ?? null,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `プロフィールの保存に失敗しました: ${res.status}`);
  }
}

export async function updateMyProfile(body: UpdateProfileBody): Promise<void> {
  if (isMockEventsApi()) {
    await new Promise((r) => setTimeout(r, 80));
    return;
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated (missing Cognito access token).");

  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.gender !== undefined) payload.gender = body.gender;
  if (body.birth_date !== undefined) payload.birth_date = body.birth_date;
  if (body.bio !== undefined) payload.bio = body.bio;
  if (body.image_key !== undefined) payload.image_key = body.image_key;

  const res = await fetch(`${getApiBaseUrl()}/me/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `プロフィールの更新に失敗しました: ${res.status}`);
  }
}

