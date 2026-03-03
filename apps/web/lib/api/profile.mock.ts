import type { HostProfile } from "@/types/event";

export async function fetchMyProfileMock(): Promise<HostProfile> {
  // setTimeoutで“それっぽい待ち”
  await new Promise((r) => setTimeout(r, 300));

  // ここは好きに変えてOK（後で /me の実装ができたら差し替える）
  return {
    name: "Kaisei",
    bio: "動画作業も雑談もOK。初心者歓迎でゆるくやってます。",
    avatarUrl: null,
  };
}