"use client";

import { useMemo, useState } from "react";
import type { HostProfile } from "@/types/event";

// ここは今ある uploader を使ってOK（なければ後で置き換え）
import EventImageUploader from "@/components/events/EventImageUploader";

type Props = {
  hostProfile: HostProfile | null;
};

type FlowItem = { title: string; minutes: number; free?: boolean };
type HostTask = { title: string; note?: string; url?: string };

export function EventCreateForm({ hostProfile }: Props) {
  // ===== 上（1枚目） =====
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("即席バドミントンA🏸");
  const [place, setPlace] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // ===== 下（2枚目） =====
  const [ageRange, setAgeRange] = useState("20代〜30代限定");
  const [scale, setScale] = useState("10〜50名");
  const [capacity, setCapacity] = useState<number>(50);

  const [mode, setMode] = useState<"FIRST" | "REPEAT">("FIRST");
  const [sliders, setSliders] = useState({
    intensity: 30,
    repeat: 20,
    social: 55,
    vibe: 40,
    gender: 50,
  });

  const [flow, setFlow] = useState<FlowItem[]>([
    { title: "準備体操", minutes: 3 },
    { title: "ペアに分かれて基礎打ち", minutes: 20 },
    { title: "ダブルスでミニゲーム", minutes: 30 },
    { title: "休憩、交流会", minutes: 15 },
    { title: "ダブルスでミニゲーム", minutes: 30 },
    { title: "解散後、交流会", minutes: 0, free: true },
  ]);

  const [rules, setRules] = useState("");
  const [tasks, setTasks] = useState<HostTask[]>([
    { title: "場所の予約", note: "体育館コート", url: "" },
    { title: "交流会の予約", note: "居酒屋", url: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      !!hostProfile &&
      !!coverUrl &&
      groupName.trim().length > 0 &&
      place.trim().length > 0 &&
      startAt.trim().length > 0 &&
      endAt.trim().length > 0 &&
      !isSubmitting
    );
  }, [hostProfile, coverUrl, groupName, place, startAt, endAt, isSubmitting]);

  async function submitMock() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      // いまはAPIなしモック：consoleでpayload確認して「作成できた気」になれるようにする
      const payload = {
        coverUrl,
        groupName,
        place,
        startAt,
        endAt,
        host: hostProfile,
        constraints: { ageRange, scale, capacity },
        atmosphere: { mode, sliders },
        flow,
        rules,
        tasks,
      };
      console.log("CREATE PAYLOAD", payload);
      alert("モック作成完了！（consoleにpayload出してる）");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hostProfile) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
        プロフィールが未取得です
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      {/* ========== 1枚目（上） ========== */}
      <div className="space-y-5">
        {/* カバー */}
        <EventImageUploader value={coverUrl} onChange={setCoverUrl} />

        {/* グループ名 */}
        <div className="text-center text-2xl font-extrabold">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-transparent text-center outline-none"
          />
        </div>

        {/* 箇条書き：場所 / 時間 / 主催者 */}
        <div className="space-y-4 px-2">
          <BulletRow label="場所">
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="例：南大沢 / 体育館 / 〇〇カフェ"
              className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
            />
          </BulletRow>

          <BulletRow label="開始,終了時間">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
              />
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
              />
            </div>
          </BulletRow>

          <BulletRow label="主催者">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-2xl bg-neutral-200">
                {hostProfile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hostProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="text-sm font-semibold">{hostProfile.name}</div>
            </div>
          </BulletRow>
        </div>
      </div>

      {/* ========== 2枚目（下） ========== */}
      <SectionTitle>制限</SectionTitle>
      <div className="grid grid-cols-[72px_1fr] gap-y-2 text-sm">
        <div className="text-neutral-500">年齢</div>
        <input className={i()} value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />

        <div className="text-neutral-500">人数規模</div>
        <input className={i()} value={scale} onChange={(e) => setScale(e.target.value)} />

        <div className="text-neutral-500">定員</div>
        <input
          type="number"
          className={i()}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value || 0))}
        />

        <div className="text-neutral-500">評価</div>
        <div className="pt-2 text-neutral-700">（作成直後は未確定）</div>
      </div>

      <SectionTitle>雰囲気</SectionTitle>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Toggle active={mode === "FIRST"} onClick={() => setMode("FIRST")}>
            初会合
          </Toggle>
          <Toggle active={mode === "REPEAT"} onClick={() => setMode("REPEAT")}>
            リピート
          </Toggle>
        </div>

        <SliderRow
          left="ゆるい"
          right="ガチ目"
          value={sliders.intensity}
          onChange={(v) => setSliders({ ...sliders, intensity: v })}
        />
        <SliderRow
          left="初回のみ"
          right="リピート歓迎"
          value={sliders.repeat}
          onChange={(v) => setSliders({ ...sliders, repeat: v })}
        />
        <SliderRow
          left="活動メイン"
          right="交流メイン"
          value={sliders.social}
          onChange={(v) => setSliders({ ...sliders, social: v })}
        />
        <SliderRow
          left="静か"
          right="ワイワイ"
          value={sliders.vibe}
          onChange={(v) => setSliders({ ...sliders, vibe: v })}
        />
        <SliderRow
          left="同性ノリ"
          right="異性ノリ"
          value={sliders.gender}
          onChange={(v) => setSliders({ ...sliders, gender: v })}
        />
      </div>

      <SectionTitle>当日の流れ</SectionTitle>
      <div className="space-y-3">
        {flow.map((it, idx) => (
          <FlowChip
            key={idx}
            title={it.title}
            minutes={it.minutes}
            free={!!it.free}
            onChange={(patch) => {
              setFlow(flow.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
            }}
            onDelete={() => setFlow(flow.filter((_, i) => i !== idx))}
          />
        ))}
        <button
          type="button"
          onClick={() => setFlow([...flow, { title: "新しい項目", minutes: 10 }])}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold"
        >
          + 項目を追加
        </button>
      </div>

      <SectionTitle>ルール</SectionTitle>
      <textarea
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
        rows={5}
        placeholder="例：勧誘・営業禁止 / 写真は許可を取ってから / 怪我防止で無理しない"
      />

      <SectionTitle>幹事</SectionTitle>
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-neutral-200">
          {hostProfile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hostProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{hostProfile.name}</div>
          <div className="line-clamp-2 text-xs text-neutral-600">{hostProfile.bio}</div>
        </div>
      </div>

      <SectionTitle>幹事タスク</SectionTitle>
      <div className="space-y-4">
        {tasks.map((t, idx) => (
          <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <input
                value={t.title}
                onChange={(e) =>
                  setTasks(tasks.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                }
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
              <button
                type="button"
                onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                className="ml-3 text-xs font-semibold text-neutral-600"
              >
                削除
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <input
                value={t.note ?? ""}
                onChange={(e) =>
                  setTasks(tasks.map((x, i) => (i === idx ? { ...x, note: e.target.value } : x)))
                }
                placeholder="メモ（例：体育館コート）"
                className={i()}
              />
              <input
                value={t.url ?? ""}
                onChange={(e) =>
                  setTasks(tasks.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))
                }
                placeholder="URL（予約ページなど）"
                className={i()}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setTasks([...tasks, { title: "新しいタスク", note: "", url: "" }])}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold"
        >
          + タスクを追加
        </button>
      </div>

      {/* Sticky Submit */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[420px] items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {groupName.trim() || "（グループ名）"}
            </div>
            <div className="truncate text-xs text-neutral-500">
              {!coverUrl ? "画像 / " : ""}
              {!place.trim() ? "場所 / " : ""}
              {(!startAt || !endAt) ? "時間" : ""}
              {canSubmit ? "OK" : "を入力してね"}
            </div>
          </div>

          <button
            onClick={submitMock}
            disabled={!canSubmit}
            className={[
              "rounded-2xl px-5 py-3 text-sm font-semibold transition",
              canSubmit ? "bg-black text-white hover:opacity-90" : "bg-neutral-200 text-neutral-500 cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmitting ? "作成中…" : "作成する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- small UI helpers ----------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-bold text-neutral-800">{children}</div>;
}

function BulletRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-1 text-lg">•</div>
      <div className="flex-1">
        <div className="text-base font-bold">{label}</div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
        active ? "bg-pink-200 text-neutral-900" : "bg-neutral-200 text-neutral-500",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SliderRow({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function FlowChip({
  title,
  minutes,
  free,
  onChange,
  onDelete,
}: {
  title: string;
  minutes: number;
  free: boolean;
  onChange: (patch: Partial<{ title: string; minutes: number; free: boolean }>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-orange-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <input
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full bg-transparent text-sm font-semibold outline-none"
        />
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-neutral-700">
          削除
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-700">
        <div className="flex items-center gap-2">
          <span>時間</span>
          <input
            type="number"
            value={minutes}
            onChange={(e) => onChange({ minutes: Number(e.target.value || 0) })}
            className="w-20 rounded-lg bg-white/70 px-2 py-1 outline-none"
          />
          <span>min</span>
          <label className="ml-2 inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => onChange({ free: e.target.checked })}
            />
            <span>free</span>
          </label>
        </div>
        <span className="italic">{free ? "free" : `${minutes}min`}</span>
      </div>
    </div>
  );
}

function i() {
  return "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none";
}