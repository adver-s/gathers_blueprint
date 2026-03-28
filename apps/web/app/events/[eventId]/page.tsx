"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDetail } from "@/types/eventsApi";
import { fetchEventById } from "@/lib/api/events";
import { fetchMyProfile } from "@/lib/api/me";
import { EventDetailView } from "@/components/events/EventDetailView";

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const { eventId: eventIdParam } = use(params);
  const eventId = Number(eventIdParam);
  const eventIdValid = Number.isInteger(eventId) && eventId > 0;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventIdValid) {
      setLoading(false);
      setError(null);
      setEvent(null);
      setMyUserId(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [me, ev] = await Promise.all([fetchMyProfile(), fetchEventById(eventId)]);
        if (cancelled) return;
        setMyUserId(me.id);
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
  }, [eventId, eventIdValid, router]);

  if (!eventIdValid) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          イベントが見つかりません（ID が不正です）
        </div>
      </main>
    );
  }

  if (loading) return <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">読み込み中...</main>;
  if (error)
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </main>
    );
  if (!event || myUserId == null)
    return <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">見つかりませんでした</main>;

  return <EventDetailView event={event} myUserId={myUserId} onJoinUpdated={setEvent} />;
}

