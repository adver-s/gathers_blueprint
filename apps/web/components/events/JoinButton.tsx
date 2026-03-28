"use client";

import { useState } from "react";
import type { EventDetail, EventStatus } from "@/types/eventsApi";
import { joinEvent, leaveEvent } from "@/lib/api/events";

type Props = {
  eventId: number;
  eventStatus: EventStatus;
  isJoined: boolean;
  isOrganizer: boolean;
  isFull: boolean;
  onUpdated?: (event: EventDetail) => void;
};

function closedJoinLabel(status: EventStatus): string {
  if (status === "CLOSED") return "募集終了";
  if (status === "CANCELLED") return "開催中止";
  return "参加できません";
}

export function JoinButton({
  eventId,
  eventStatus,
  isJoined,
  isOrganizer,
  isFull,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const recruitingOpen = eventStatus === "OPEN";
  const joinDisabled = !isJoined && (!recruitingOpen || isFull);

  const handleClick = async () => {
    setActionError(null);
    try {
      setLoading(true);
      const updated = isJoined ? await leaveEvent(eventId) : await joinEvent(eventId);
      onUpdated?.(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "処理に失敗しました";
      setActionError(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
    } finally {
      setLoading(false);
    }
  };

  if (isOrganizer) {
    return (
      <div className="rounded-full bg-gray-900 px-6 py-4 text-center text-lg font-bold text-white">あなたは幹事です</div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || joinDisabled}
        className="w-full rounded-full bg-cyan-200 px-6 py-4 text-center text-2xl font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] disabled:opacity-60"
      >
        {loading
          ? "処理中..."
          : isJoined
            ? "参加を取り消す"
            : !recruitingOpen
              ? closedJoinLabel(eventStatus)
              : isFull
                ? "満員です"
                : "参加したい"}
      </button>
      {actionError ? (
        <p className="text-center text-xs text-red-600" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}

