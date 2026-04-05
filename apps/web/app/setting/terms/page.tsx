import Link from "next/link";
import { TERMS_BODY } from "@/lib/legal/termsContent";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <Link
        href="/setting"
        className="mb-6 inline-block text-sm text-neutral-600 underline underline-offset-4"
      >
        ← 設定に戻る
      </Link>
      <h1 className="mb-6 text-2xl font-bold">利用規約</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
        {TERMS_BODY}
      </div>
    </div>
  );
}
