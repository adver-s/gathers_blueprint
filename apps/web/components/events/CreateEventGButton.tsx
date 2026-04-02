"use client";

import Link from "next/link";
import { Irish_Grover } from "next/font/google";

const irishGrover = Irish_Grover({
  weight: "400",
  subsets: ["latin"],
});

export function CreateEventGButton() {
  return (
    <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 w-full max-w-sm -translate-x-1/2">
      <div className="pointer-events-auto flex items-end justify-end pr-1">
        <Link
          href="/group_create"
          aria-label="イベントを作成"
          className="block text-black -translate-y-0.5"
        >
          <span
            className={`${irishGrover.className} block text-[5.85rem] leading-none tracking-tight`}
          >
            G
          </span>
        </Link>
      </div>
    </div>
  );
}
