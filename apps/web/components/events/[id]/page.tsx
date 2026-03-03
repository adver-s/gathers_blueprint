"use client";

import { useEffect, useState } from "react";
import { getEventMock } from "@/lib/api/events.mock";
import type { Event } from "@/types/event";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const e = await getEventMock(params.id);
        setEvent(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (!event) return <div className="p-6">見つかりませんでした</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>

      <div className="mt-4 grid gap-3 rounded-2xl border p-4">
        {event.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt=""
            className="h-56 w-full rounded-xl object-cover"
          />
        )}

        <div className="text-sm">
          <div>場所：{event.place}</div>
          <div>
            時間：{new Date(event.startAt).toLocaleString()} 〜{" "}
            {new Date(event.endAt).toLocaleString()}
          </div>
          <div>上限：{event.capacity} 人</div>
        </div>

        <div className="text-sm">
          <div className="font-medium">活動タグ</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {event.activityTags.map((t) => (
              <span key={t} className="rounded-full border px-3 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <div className="font-medium">雰囲気</div>
          <p className="mt-2 whitespace-pre-wrap opacity-90">{event.atmosphereText}</p>
        </div>

        <div className="text-sm">
          <div className="font-medium">幹事</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border">
              {event.owner.avatarUrl ? (
                <img src={event.owner.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] opacity-60">
                  no img
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold">{event.owner.name}</div>
              <div className="text-xs opacity-70">{event.owner.bio}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}