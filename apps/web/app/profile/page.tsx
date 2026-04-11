"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TestProfileView } from "@/components/profile/TestProfileView";
import {
  fetchMyProfile,
  updateMyProfile,
  type MyProfile,
} from "@/lib/api/me";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { syncAuthUser } from "@/lib/api/authSync";
import { GENDERS } from "@/lib/constants/gender";
import {
  friendlyProfileErrorMessage,
  getProfileApiErrorRecovery,
} from "@/lib/profile/profileApiErrors";

function syncFormFromProfile(p: MyProfile, setters: {
  setName: (v: string) => void;
  setGender: (v: number) => void;
  setBirthDate: (v: string) => void;
  setBio: (v: string) => void;
}) {
  setters.setName(p.name);
  setters.setGender(p.gender);
  if (p.birth_date) setters.setBirthDate(p.birth_date.slice(0, 10));
  setters.setBio(p.bio ?? "");
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRecovery, setErrorRecovery] = useState<
    "none" | "goLogin" | "resync"
  >("none");
  const [resyncBusy, setResyncBusy] = useState(false);
  /** 案 A: 初回マウントで User not found のとき 1 回だけ POST /auth/sync して再フェッチ */
  const didAutoResyncOnMountRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMyProfile();
        if (cancelled) return;
        setProfile(me);
        setErrorRecovery("none");
        syncFormFromProfile(me, { setName, setGender, setBirthDate, setBio });
      } catch (e) {
        if (cancelled) return;
        let msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        let recovery = getProfileApiErrorRecovery(msg);

        if (
          recovery === "resync" &&
          !isMockEventsApi() &&
          !didAutoResyncOnMountRef.current
        ) {
          didAutoResyncOnMountRef.current = true;
          try {
            await syncAuthUser();
            const me = await fetchMyProfile();
            if (cancelled) return;
            setProfile(me);
            setErrorRecovery("none");
            setError(null);
            syncFormFromProfile(me, { setName, setGender, setBirthDate, setBio });
          } catch (e2) {
            if (cancelled) return;
            msg = e2 instanceof Error ? e2.message : "読み込みに失敗しました";
            recovery = getProfileApiErrorRecovery(msg);
            setErrorRecovery(recovery);
            setError(friendlyProfileErrorMessage(msg, recovery));
            if (recovery === "goLogin") router.replace("/login");
          }
        } else {
          setErrorRecovery(recovery);
          setError(friendlyProfileErrorMessage(msg, recovery));
          if (recovery === "goLogin") router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const openEdit = () => {
    if (!profile) return;
    syncFormFromProfile(profile, { setName, setGender, setBirthDate, setBio });
    setError(null);
    setErrorRecovery("none");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!profile) return;
    syncFormFromProfile(profile, { setName, setGender, setBirthDate, setBio });
    setError(null);
    setErrorRecovery("none");
    setIsEditing(false);
  };

  const onResyncAccount = async () => {
    if (isMockEventsApi()) return;
    setResyncBusy(true);
    setError(null);
    try {
      await syncAuthUser();
      const me = await fetchMyProfile();
      setProfile(me);
      setErrorRecovery("none");
      syncFormFromProfile(me, { setName, setGender, setBirthDate, setBio });
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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setErrorRecovery("none");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        gender,
        birth_date: birthDate,
        bio: bio.trim() || null,
      };
      await updateMyProfile(payload);
      if (isMockEventsApi()) {
        setProfile({
          ...profile,
          ...payload,
        });
      } else {
        const me = await fetchMyProfile();
        setProfile(me);
        syncFormFromProfile(me, { setName, setGender, setBirthDate, setBio });
      }
      setIsEditing(false);
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

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
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
        ) : (
          <p className="text-sm text-neutral-600">プロフィールを読み込めませんでした。</p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <h1 className="mb-2 text-2xl font-bold">プロフィール</h1>
      <p className="mb-4 text-sm text-neutral-600">
        「編集する」から内容を変更できます。
        {isMockEventsApi() ? "（モック時は保存がローカルのみ）" : null}
      </p>

      <div className="rounded-3xl border border-neutral-200 bg-white">
        <TestProfileView
          profile={profile}
          onEditPress={!isEditing ? openEdit : undefined}
        />
      </div>

      {isEditing ? (
        <form onSubmit={onSave} className="mt-6 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="order-2 rounded-2xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50 sm:order-1"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className={[
                "order-1 rounded-2xl px-5 py-3 text-sm font-semibold transition sm:order-2",
                saving ? "bg-neutral-200 text-neutral-500" : "bg-black text-white hover:opacity-90",
              ].join(" ")}
            >
              {saving ? "保存中..." : "変更を保存"}
            </button>
          </div>
        </form>
      ) : null}
    </main>
  );
}
