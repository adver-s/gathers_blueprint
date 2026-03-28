"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  EventDetail,
  EventMood,
  EventRestrictions,
  EventScheduleItem,
  EventUpdatePayload,
} from "@/types/eventsApi";
import { updateEvent } from "@/lib/api/events";

type Props = {
  mode: "create" | "edit";
  initialData?: EventDetail;
};

function toInputDateTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function ensureId(maybeId: string | undefined) {
  if (maybeId) return maybeId;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function EventForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [imageKey, setImageKey] = useState(initialData?.image_key ?? "");
  const [place, setPlace] = useState(initialData?.place ?? "");
  const [startAt, setStartAt] = useState(toInputDateTime(initialData?.starts_at));
  const [capacity, setCapacity] = useState(String(initialData?.capacity ?? 20));
  const [description, setDescription] = useState(initialData?.description ?? "");

  const [ruleText, setRuleText] = useState(initialData?.ruleText ?? "");

  const [restrictions, setRestrictions] = useState<EventRestrictions>(
    initialData?.restrictions ?? {
      ageRange: null,
      scale: null,
      capacityText: null,
      level: null,
    },
  );

  const [mood, setMood] = useState<EventMood>(
    initialData?.mood ?? {
      firstMeet: 30,
      casual: 30,
      active: 30,
      calm: 30,
      indoor: 30,
      outdoor: 30,
    },
  );

  const [scheduleItems, setScheduleItems] = useState<EventScheduleItem[]>(
    initialData?.scheduleItems?.length
      ? initialData.scheduleItems.map((it) => ({ ...it, id: ensureId(it.id) }))
      : [{ id: ensureId(undefined), title: "準備", minutes: 10 }],
  );

  const submitLabel = useMemo(() => {
    if (loading) return "保存中...";
    return mode === "create" ? "イベントを作成" : "変更を保存";
  }, [loading, mode]);

  const canSubmit = useMemo(() => {
    if (mode === "create") return false; // 現状 edit 実装を優先
    return (
      !!initialData &&
      title.trim().length > 0 &&
      place.trim().length > 0 &&
      !!startAt &&
      Number(capacity) > 0 &&
      !loading
    );
  }, [capacity, initialData, loading, mode, place, startAt, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload: EventUpdatePayload = {
        title,
        image_key: imageKey || null,
        place,
        starts_at: new Date(startAt).toISOString(),
        capacity: Number(capacity),
        description,
        ruleText: ruleText || null,
        restrictions: {
          ageRange: restrictions.ageRange ?? null,
          scale: restrictions.scale ?? null,
          capacityText: restrictions.capacityText ?? null,
          level: restrictions.level ?? null,
        },
        mood,
        scheduleItems,
      };

      await updateEvent(initialData.id, payload);
      router.push(`/events/${initialData.id}`);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "create") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
        現状は編集画面のみ実装しています。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <div className="space-y-4">
        <div className="text-sm font-bold text-neutral-800">基本情報</div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベント名"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
        />

        <input
          value={imageKey}
          onChange={(e) => setImageKey(e.target.value)}
          placeholder="image_key（S3 key or URL）"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
        />

        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="場所"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm outline-none"
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="定員"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm outline-none"
          />
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明"
          className="min-h-24 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          rows={5}
        />
      </div>

      <div className="space-y-4">
        <div className="text-sm font-bold text-neutral-800">制限</div>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={restrictions.ageRange ?? ""}
            onChange={(e) => setRestrictions((r) => ({ ...r, ageRange: e.target.value }))}
            placeholder="年齢（例: 20代〜30代）"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            value={restrictions.scale ?? ""}
            onChange={(e) => setRestrictions((r) => ({ ...r, scale: e.target.value }))}
            placeholder="人数規模（例: 10〜50名）"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            value={restrictions.capacityText ?? ""}
            onChange={(e) => setRestrictions((r) => ({ ...r, capacityText: e.target.value }))}
            placeholder="定員表示（例: 50人）"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          />
          <input
            value={restrictions.level ?? ""}
            onChange={(e) => setRestrictions((r) => ({ ...r, level: e.target.value }))}
            placeholder="評価（例: 初心者歓迎）"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-bold text-neutral-800">雰囲気</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            初回◎
            <input
              type="number"
              min={0}
              max={100}
              value={mood.firstMeet}
              onChange={(e) => setMood((m) => ({ ...m, firstMeet: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            ゆるい
            <input
              type="number"
              min={0}
              max={100}
              value={mood.casual}
              onChange={(e) => setMood((m) => ({ ...m, casual: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            活発
            <input
              type="number"
              min={0}
              max={100}
              value={mood.active}
              onChange={(e) => setMood((m) => ({ ...m, active: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            落ち着き
            <input
              type="number"
              min={0}
              max={100}
              value={mood.calm}
              onChange={(e) => setMood((m) => ({ ...m, calm: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            室内
            <input
              type="number"
              min={0}
              max={100}
              value={mood.indoor}
              onChange={(e) => setMood((m) => ({ ...m, indoor: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-neutral-600">
            屋外
            <input
              type="number"
              min={0}
              max={100}
              value={mood.outdoor}
              onChange={(e) => setMood((m) => ({ ...m, outdoor: Number(e.target.value) }))}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-bold text-neutral-800">当日の流れ</div>
        <div className="space-y-3">
          {scheduleItems.map((it, idx) => (
            <div key={it.id} className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={it.title}
                  onChange={(e) => {
                    setScheduleItems((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                    );
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
                  placeholder="項目タイトル"
                />
                <button
                  type="button"
                  className="rounded-xl bg-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700"
                  onClick={() => setScheduleItems((prev) => prev.filter((_, i) => i !== idx))}
                >
                  削除
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-neutral-600">minutes</label>
                <input
                  type="number"
                  value={it.minutes ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    setScheduleItems((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, minutes: val } : x)),
                    );
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
                  placeholder="例: 15"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setScheduleItems((prev) => [
                ...prev,
                { id: ensureId(undefined), title: "新しい項目", minutes: 10 },
              ])
            }
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold"
          >
            + 項目を追加
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-bold text-neutral-800">ルール</div>
        <textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          placeholder="例：勧誘・営業禁止 / 写真は許可を取ってから / 怪我防止で無理しない"
          className="min-h-28 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          rows={6}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[420px] items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{title.trim() || "（イベント）"}</div>
            <div className="truncate text-xs text-neutral-500">{canSubmit ? "OK" : "入力してください"}</div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "rounded-2xl px-5 py-3 text-sm font-semibold transition",
              canSubmit ? "bg-black text-white hover:opacity-90" : "bg-neutral-200 text-neutral-500 cursor-not-allowed",
            ].join(" ")}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

