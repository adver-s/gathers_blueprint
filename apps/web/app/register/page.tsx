"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmSignUp, signIn, signUp } from "aws-amplify/auth";
import { ensureAmplifyConfigured } from "@/lib/auth/amplify";
import { postAuthSyncAndNavigate } from "@/lib/auth/postAuthSync";

type Phase = "form" | "confirm";

export default function RegisterPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishWithSession = async () => {
    await signIn({ username: email, password });
    await postAuthSyncAndNavigate(router, { displayName: displayName.trim() });
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await ensureAmplifyConfigured();
      // 表示名は POST /auth/sync の body で DB に入れる（プールの必須属性差で失敗しないよう email のみ）
      const out = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      if (out.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setPhase("confirm");
        return;
      }
      await finishWithSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await ensureAmplifyConfigured();
      await confirmSignUp({ username: email, confirmationCode: code.trim() });
      await finishWithSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "確認に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <h1 className="mb-6 text-2xl font-bold">新規登録</h1>

      {phase === "form" ? (
        <form onSubmit={onSubmitForm} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
          <label className="space-y-1 text-sm font-semibold">
            <span>表示名</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none"
              type="text"
              autoComplete="nickname"
              required
              maxLength={50}
            />
          </label>

          <label className="space-y-1 text-sm font-semibold">
            <span>メール</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-semibold">
            <span>パスワード</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>

          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading || !email || !password || !displayName.trim()}
            className={[
              "w-full rounded-2xl px-5 py-3 text-sm font-semibold transition",
              loading ? "bg-neutral-200 text-neutral-500" : "bg-black text-white hover:opacity-90",
            ].join(" ")}
          >
            {loading ? "送信中..." : "登録する"}
          </button>

          <p className="text-center text-sm text-neutral-600">
            すでにアカウントがある方は{" "}
            <Link href="/login" className="font-semibold text-black underline">
              ログイン
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={onSubmitConfirm} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">
            <span className="font-mono">{email}</span> に送られた確認コードを入力してください。
          </p>

          <label className="space-y-1 text-sm font-semibold">
            <span>確認コード</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 font-mono outline-none"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </label>

          {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={[
              "w-full rounded-2xl px-5 py-3 text-sm font-semibold transition",
              loading ? "bg-neutral-200 text-neutral-500" : "bg-black text-white hover:opacity-90",
            ].join(" ")}
          >
            {loading ? "確認中..." : "確認してはじめる"}
          </button>
        </form>
      )}
    </main>
  );
}
