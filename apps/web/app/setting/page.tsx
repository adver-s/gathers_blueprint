"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { ensureAmplifyConfigured } from "@/lib/auth/amplify";

const feedbackFormUrl =
  typeof process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL === "string"
    ? process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL.trim()
    : "";

export default function SettingPage() {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLogoutError(null);
    setLoggingOut(true);
    try {
      await ensureAmplifyConfigured();
      // ローカルだけでなく Cognito のリフレッシュも無効化し、残セッションで signIn が衝突するのを防ぐ
      await signOut({ global: true });
      router.replace("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "ログアウトに失敗しました";
      setLogoutError(message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <section className="mb-10 text-center">
        <h2 className="mb-4 text-sm font-medium text-neutral-800">
          ご意見BOX トラブル報告
        </h2>
        {feedbackFormUrl ? (
          <a
            href={feedbackFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded border-2 border-sky-400 bg-neutral-200 px-4 py-3 text-sm font-medium text-neutral-900"
          >
            入力フォーム
          </a>
        ) : (
          <p className="text-sm text-neutral-500">
            フォーム URL が未設定です。環境変数{" "}
            <span className="font-mono text-xs">NEXT_PUBLIC_FEEDBACK_FORM_URL</span>{" "}
            を設定してください。
          </p>
        )}
      </section>

      <section className="mb-10 text-center">
        <h2 className="mb-4 text-sm font-medium text-neutral-800">
          利用規約, プライバシーポリシー
        </h2>
        <nav className="flex flex-col items-center gap-3 text-sm">
          <Link
            href="/setting/terms"
            className="text-neutral-900 underline underline-offset-4"
          >
            利用規約
          </Link>
          <Link
            href="/setting/privacy"
            className="text-neutral-900 underline underline-offset-4"
          >
            プライバシーポリシー
          </Link>
        </nav>
      </section>

      <section className="mt-16 text-center">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="text-base font-bold text-black disabled:opacity-50"
        >
          {loggingOut ? "ログアウト中…" : "ログアウトする"}
        </button>
        {logoutError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {logoutError}
          </p>
        ) : null}
      </section>
    </div>
  );
}
