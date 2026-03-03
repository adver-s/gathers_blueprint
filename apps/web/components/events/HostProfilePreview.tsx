"use client";

import type { HostProfile } from "@/types/event";

export function HostProfilePreview({ profile }: { profile: HostProfile | null }) {
  if (!profile) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-sm font-medium">幹事プロフィール</div>
        <div className="mt-2 text-sm opacity-70">未取得</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm font-medium">幹事プロフィール（自動で掲載）</div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full border">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs opacity-60">
              no img
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold">{profile.name}</div>
          <div className="text-xs opacity-70">{profile.bio}</div>
        </div>
      </div>
    </div>
  );
}