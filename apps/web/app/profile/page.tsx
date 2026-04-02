"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TestProfileView } from "@/components/profile/TestProfileView";
import {
  fetchMyProfile,
  updateMyProfile,
  type MyProfile,
} from "@/lib/api/me";
import { isMockEventsApi } from "@/lib/api/mock/isMockEventsApi";
import { GENDERS } from "@/lib/constants/gender";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMyProfile();
        if (cancelled) return;
        setProfile(me);
        syncFormFromProfile(me, { setName, setGender, setBirthDate, setBio });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        setError(msg);
        if (msg.includes("Not authenticated")) router.replace("/login");
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
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!profile) return;
    syncFormFromProfile(profile, { setName, setGender, setBirthDate, setBio });
    setError(null);
    setIsEditing(false);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
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
      setError(err instanceof Error ? err.message : "保存に失敗しました");
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
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
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

          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

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
