import Link from "next/link";

export default function GroupPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pt-8 pb-24">
      <h1 className="mb-4 text-3xl font-bold">Group</h1>
      <Link
        href="/group_create"
        className="inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
      >
        Create Group
      </Link>
    </main>
  );
}

