"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDetail } from "@/types/eventsApi";
import { fetchEventById } from "@/lib/api/events";
import { fetchMyProfile } from "@/lib/api/me";
import { EventForm } from "@/components/events/EventForm";

export default function EventEditPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const { eventId: eventIdParam } = use(params);
  const eventId = Number(eventIdParam);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [me, ev] = await Promise.all([fetchMyProfile(), fetchEventById(eventId)]);
        if (cancelled) return;
        if (ev.owner.user_id !== me.id) {
          router.push(`/events/${eventId}`);
          return;
        }
        setEvent(ev);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "イベントの取得に失敗しました";
        setError(message);
        if (message.includes("Not authenticated")) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, router]);

  if (loading)
    return <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">読み込み中...</main>;

  if (error)
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </main>
    );

  if (!event)
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
        <div className="text-sm text-neutral-600">見つかりませんでした</div>
      </main>
    );

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">イベント編集</h1>
      <EventForm mode="edit" initialData={event} />
    </main>
  );
}

