"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventListItem } from "@/types/eventsApi";
import { fetchMyScheduleEvents } from "@/lib/api/events";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { EventCard } from "@/components/events/EventCard";

export default function SchedulePage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyScheduleEvents();
        if (cancelled) return;
        setEvents(data);
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
  }, [router]);

  return (
    <main className="relative mx-auto min-h-screen max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-4 text-3xl font-bold">予約済みのイベント</h1>

      {isMockEventsApi() ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
          デモデータ表示中（<span className="font-mono">NEXT_PUBLIC_MOCK_EVENTS</span>
          ）。本番では API・ログインが必要です。
        </div>
      ) : null}

      {loading ? <div className="text-sm text-neutral-600">読み込み中...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {!loading && !error && events.length === 0 ? (
        <p className="text-sm text-neutral-600">参加中・幹事のイベントはまだありません。</p>
      ) : null}

      <section className="space-y-5">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
}
