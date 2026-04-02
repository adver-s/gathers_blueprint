"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { fetchMyProfile } from "@/lib/api/me";
import { imageKeyToUrl } from "@/lib/images/imageKeyToUrl";
import type { HostProfile } from "@/types/event";

export default function CreatePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await fetchMyProfile();
        if (cancelled) return;
        setProfile({
          name: me.name,
          bio: me.bio ?? "",
          avatarUrl: imageKeyToUrl(me.image_key),
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "読み込みに失敗しました";
        if (message.includes("Not authenticated")) {
          router.push("/login");
          return;
        }
        setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) return <main className="p-6 text-sm text-red-700">{error}</main>;
  if (!profile) return <main className="p-6">読み込み中...</main>;

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <EventCreateForm hostProfile={profile} />
    </main>
  );
}
