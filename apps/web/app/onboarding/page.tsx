"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { syncAuthUser } from "@/lib/api/authSync";
import { fetchMyProfile, setupMyProfile } from "@/lib/api/me";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { GENDERS } from "@/lib/constants/gender";
import {
  friendlyProfileErrorMessage,
  getProfileApiErrorRecovery,
} from "@/lib/profile/profileApiErrors";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootFailed, setBootFailed] = useState(false);
  const [errorRecovery, setErrorRecovery] = useState<
    "none" | "goLogin" | "resync"
  >("none");
  const [resyncBusy, setResyncBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMyProfile();
        if (cancelled) return;
        if (me.profile_detail_completed) {
          router.replace("/events");
          return;
        }
        setBootFailed(false);
        setErrorRecovery("none");
        setName(me.name);
        setGender(me.gender);
        if (me.birth_date) setBirthDate(me.birth_date.slice(0, 10));
      } catch (e) {
        if (cancelled) return;
        setBootFailed(true);
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        const recovery = getProfileApiErrorRecovery(msg);
        setErrorRecovery(recovery);
        setError(friendlyProfileErrorMessage(msg, recovery));
        if (recovery === "goLogin") router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onResyncAccount = async () => {
    if (isMockEventsApi()) return;
    setResyncBusy(true);
    setError(null);
    try {
      await syncAuthUser();
      const me = await fetchMyProfile();
      if (me.profile_detail_completed) {
        router.replace("/events");
        return;
      }
      setBootFailed(false);
      setErrorRecovery("none");
      setName(me.name);
      setGender(me.gender);
      if (me.birth_date) setBirthDate(me.birth_date.slice(0, 10));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "同期に失敗しました";
      const recovery = getProfileApiErrorRecovery(msg);
      setErrorRecovery(recovery);
      setError(friendlyProfileErrorMessage(msg, recovery));
      if (recovery === "goLogin") router.replace("/login");
    } finally {
      setResyncBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorRecovery("none");
    setSaving(true);
    try {
      await setupMyProfile({
        name: name.trim(),
        gender,
        birth_date: birthDate,
        bio: bio.trim() || null,
      });
      router.replace("/events");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      const recovery = getProfileApiErrorRecovery(msg);
      setErrorRecovery(recovery);
      setError(friendlyProfileErrorMessage(msg, recovery));
      if (recovery === "goLogin") router.replace("/login");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
        <p className="text-sm text-neutral-600">読み込み中...</p>
      </main>
    );
  }

  if (bootFailed) {
    return (
      <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
        <h1 className="mb-2 text-2xl font-bold">プロフィールを読み込めませんでした</h1>
        {error ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
            {errorRecovery === "resync" && !isMockEventsApi() ? (
              <button
                type="button"
                disabled={resyncBusy}
                onClick={() => void onResyncAccount()}
                className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {resyncBusy ? "同期中..." : "サーバーと同期する"}
              </button>
            ) : null}
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <h1 className="mb-2 text-2xl font-bold">プロフィールを完成させましょう</h1>
      <p className="mb-6 text-sm text-neutral-600">
        表示名・性別・生年月日を登録すると、イベント機能をご利用いただけます。
        {isMockEventsApi() ? "（モック時は保存はスキップされます）" : null}
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
        <label className="space-y-1 text-sm font-semibold">
          <span>表示名</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none"
            required
            maxLength={50}
          />
        </label>

        <label className="space-y-1 text-sm font-semibold">
          <span>性別</span>
          <select
            value={gender}
            onChange={(e) => setGender(Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-semibold">
          <span>生年月日</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none"
            required
          />
        </label>

        <label className="space-y-1 text-sm font-semibold">
          <span>自己紹介（任意）</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none"
          />
        </label>

        {error ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
            {errorRecovery === "resync" && !isMockEventsApi() ? (
              <button
                type="button"
                disabled={resyncBusy || saving}
                onClick={() => void onResyncAccount()}
                className="w-full rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
              >
                {resyncBusy ? "同期中..." : "サーバーと同期してから再試行"}
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className={[
            "w-full rounded-2xl px-5 py-3 text-sm font-semibold transition",
            saving ? "bg-neutral-200 text-neutral-500" : "bg-black text-white hover:opacity-90",
          ].join(" ")}
        >
          {saving ? "保存中..." : "保存してはじめる"}
        </button>
      </form>
    </main>
  );
}
