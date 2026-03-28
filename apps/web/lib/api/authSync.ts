"use client";

import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getIdToken } from "@/lib/auth/getIdToken";

export type AuthSyncResult = {
  user_id: number;
  needs_profile_detail: boolean;
};

export async function syncAuthUser(displayName?: string): Promise<AuthSyncResult> {
  const idToken = await getIdToken();
  if (!idToken) {
    throw new Error("ID トークンを取得できませんでした。");
  }

  const res = await fetch(`${getApiBaseUrl()}/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      display_name: displayName?.trim() || null,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `同期に失敗しました: ${res.status}`);
  }

  return (await res.json()) as AuthSyncResult;
}
