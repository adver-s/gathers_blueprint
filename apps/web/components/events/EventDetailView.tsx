import Link from "next/link";
import type { EventDetail, EventStatus } from "@/types/eventsApi";
import { imageKeyToUrl } from "@/lib/images/imageKeyToUrl";
import { JoinButton } from "@/components/events/JoinButton";

function formatDateTime(dateIso: string) {
  return new Date(dateIso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: EventStatus): string {
  switch (status) {
    case "OPEN":
      return "募集中";
    case "CLOSED":
      return "募集終了";
    case "CANCELLED":
      return "開催中止";
    default:
      return status;
  }
}

function MoodBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[72px_1fr_48px] items-center gap-2 text-sm">
      <span>{label}</span>
      <div className="h-2 rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-pink-300" style={{ width: `${value}%` }} />
      </div>
      <span>{value}</span>
    </div>
  );
}

export function EventDetailView({
  event,
  myUserId,
  onJoinUpdated,
}: {
  event: EventDetail;
  myUserId: number;
  onJoinUpdated?: (event: EventDetail) => void;
}) {
  const isOrganizer = event.owner.user_id === myUserId;
  const isJoined = event.participants.some((p) => p.user_id === myUserId);
  const isFull = event.joined_count >= event.capacity;

  return (
    <main className="mx-auto min-h-screen bg-[#f7f7f7] px-4 pb-28 pt-4">
      <div className="overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[18px] bg-gray-100">
          {imageKeyToUrl(event.image_key) ? (
            <img
              src={imageKeyToUrl(event.image_key) ?? undefined}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              event.status === "OPEN"
                ? "bg-emerald-100 text-emerald-900"
                : event.status === "CLOSED"
                  ? "bg-neutral-200 text-neutral-800"
                  : "bg-red-100 text-red-900"
            }`}
          >
            {statusLabel(event.status)}
          </span>
        </div>

        {event.description.trim() ? (
          <section className="mb-6">
            <h2 className="mb-2 text-lg font-bold">詳細</h2>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{event.description}</p>
          </section>
        ) : null}

        <div className="space-y-2 text-sm">
          <p>・場所 {event.place}</p>
          {event.locationNote ? (
            <p className="whitespace-pre-wrap pl-4 text-neutral-600">{event.locationNote}</p>
          ) : null}
          <p>・開始 {formatDateTime(event.starts_at)}</p>
          <p>
            ・参加者 {event.joined_count}/{event.capacity}人
          </p>
        </div>

        {event.reservationNote ? (
          <section className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">予約・持ち物など</p>
            <p className="mt-1 whitespace-pre-wrap leading-6">{event.reservationNote}</p>
          </section>
        ) : null}

        <div className="my-6 flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
            {imageKeyToUrl(event.owner.image_key) ? (
              <img
                src={imageKeyToUrl(event.owner.image_key) ?? undefined}
                alt={event.owner.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <p className="text-3xl font-black">{event.owner.name}</p>
        </div>

        {event.restrictions && (
          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">制限</h2>
            <div className="space-y-2 text-sm">
              {event.restrictions.ageRange ? <p>年齢 {event.restrictions.ageRange}</p> : null}
              {event.restrictions.scale ? <p>人数規模 {event.restrictions.scale}</p> : null}
              {event.restrictions.capacityText ? <p>定員 {event.restrictions.capacityText}</p> : null}
              {event.restrictions.level ? <p>評価 {event.restrictions.level}</p> : null}
            </div>
          </section>
        )}

        {event.mood && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">雰囲気</h2>
            <div className="space-y-3">
              <MoodBar label="初回◎" value={event.mood.firstMeet} />
              <MoodBar label="ゆるい" value={event.mood.casual} />
              <MoodBar label="活発" value={event.mood.active} />
              <MoodBar label="落ち着き" value={event.mood.calm} />
              <MoodBar label="室内" value={event.mood.indoor} />
              <MoodBar label="屋外" value={event.mood.outdoor} />
            </div>
          </section>
        )}

        {!!event.scheduleItems?.length && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">当日の流れ</h2>
            <div className="space-y-3">
              {event.scheduleItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-full bg-[#f4c8b5] px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-end justify-between gap-4">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm italic">{item.minutes ? `${item.minutes}min` : "free"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!event.ruleText && (
          <section className="mt-8">
            <h2 className="mb-2 text-2xl font-bold">ルール</h2>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{event.ruleText}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-2xl font-bold">参加者</h2>
          <div className="grid grid-cols-2 gap-4">
            {event.participants.map((member) => (
              <div key={member.user_id} className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-[16px] bg-gray-100">
                  {imageKeyToUrl(member.image_key) ? (
                    <img
                      src={imageKeyToUrl(member.image_key) ?? undefined}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="text-sm font-medium">{member.name}</p>
              </div>
            ))}
          </div>
        </section>

        {isOrganizer && (
          <div className="mt-8">
            <Link
              href={`/events/${event.id}/edit`}
              className="block w-full rounded-full bg-black px-6 py-4 text-center text-lg font-bold text-white"
            >
              このイベントを編集する
            </Link>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-gradient-to-t from-white via-white to-transparent p-4">
        <JoinButton
          eventId={event.id}
          eventStatus={event.status}
          isJoined={isJoined}
          isOrganizer={isOrganizer}
          isFull={isFull}
          onUpdated={onJoinUpdated}
        />
      </div>
    </main>
  );
}

