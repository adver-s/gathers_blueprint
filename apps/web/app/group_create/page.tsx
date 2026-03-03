"use client";

import { useEffect, useState } from "react";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { fetchMyProfileMock } from "@/lib/api/profile.mock";
import type { HostProfile } from "@/types/event";

export default function CreatePage() {
  const [profile, setProfile] = useState<HostProfile | null>(null);

  useEffect(() => {
    (async () => {
      const p = await fetchMyProfileMock();
      setProfile(p);
    })();
  }, []);

  if (!profile) return <main className="p-6">読み込み中...</main>;

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <EventCreateForm hostProfile={profile} />
    </main>
  );
}