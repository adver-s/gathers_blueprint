import Link from "next/link";

export default function MeetPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
      <h1 className="mb-4 text-3xl font-bold">Gathers</h1>
      <p className="mb-6 text-sm text-neutral-600">イベント一覧へ移動します。</p>
      <Link
        href="/events"
        className="inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
      >
        イベント一覧
      </Link>
    </main>
  );
}

