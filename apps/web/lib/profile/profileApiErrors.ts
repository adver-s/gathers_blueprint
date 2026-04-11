/**
 * GET/PATCH /me/profile などが返す本文（JSON の detail 含む）から、UI でのリカバリ方針を決める。
 */
export type ProfileApiErrorRecovery = "none" | "goLogin" | "resync";

export function getProfileApiErrorRecovery(message: string): ProfileApiErrorRecovery {
  if (message.includes("Not authenticated")) {
    return "goLogin";
  }
  if (message.includes("Could not validate credentials")) {
    return "goLogin";
  }
  if (message.includes("User not found")) {
    return "resync";
  }
  return "none";
}

export function friendlyProfileErrorMessage(
  message: string,
  recovery: ProfileApiErrorRecovery,
): string {
  if (recovery === "goLogin") {
    return "セッションが無効です。もう一度ログインしてください。";
  }
  if (recovery === "resync") {
    return "サーバーにユーザー情報がありません。下のボタンで同期するか、ログインし直してください。";
  }
  return message;
}
