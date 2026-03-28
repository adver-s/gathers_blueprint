"use client";

import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { syncAuthUser } from "@/lib/api/authSync";

type ReplaceRouter = { replace: (href: string) => void };

/**
 * ログイン／登録直後: DB 同期し、プロフィール未完了なら /onboarding へ。
 * モック API 有効時は API を呼ばず /events へ（ローカル Cognito なしでも動かすため）。
 */
export async function postAuthSyncAndNavigate(
  router: ReplaceRouter,
  opts?: { displayName?: string },
): Promise<void> {
  if (isMockEventsApi()) {
    router.replace("/events");
    return;
  }

  const result = await syncAuthUser(opts?.displayName);
  if (result.needs_profile_detail) {
    router.replace("/onboarding");
  } else {
    router.replace("/events");
  }
}
