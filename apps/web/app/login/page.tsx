"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ensureAmplifyConfigured } from "@/lib/auth/amplify";
import { signInThenPostAuthSync } from "@/lib/auth/signInThenPostAuthSync";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await ensureAmplifyConfigured();

      // Cognito のユーザー名（サインインID）として email を使う前提。
      await signInThenPostAuthSync(router, { username: email, password });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ログインに失敗しました";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[420px] px-4 pt-6 pb-28">
      <h1 className="mb-6 text-2xl font-bold">ログイン</h1>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
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
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className={[
            "w-full rounded-2xl px-5 py-3 text-sm font-semibold transition",
            loading ? "bg-neutral-200 text-neutral-500" : "bg-black text-white hover:opacity-90",
          ].join(" ")}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <p className="text-center text-sm text-neutral-600">
          はじめての方は{" "}
          <Link href="/register" className="font-semibold text-black underline">
            新規登録
          </Link>
        </p>
      </form>
    </main>
  );
}

