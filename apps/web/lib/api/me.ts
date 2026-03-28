"use client";

import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getMockMyProfile } from "@/lib/api/mock/eventsApiSeed";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { getAccessToken } from "@/lib/auth/getAccessToken";

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

export async function fetchMyProfile(): Promise<MyProfile> {
  if (isMockEventsApi()) {
    await new Promise((r) => setTimeout(r, 80));
    return getMockMyProfile();
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated (missing Cognito access token).");

  const res = await fetch(`${getApiBaseUrl()}/me/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as MyProfile;
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

