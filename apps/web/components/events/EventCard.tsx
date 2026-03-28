import Link from "next/link";
import type { EventListItem, ParticipantOut } from "@/types/eventsApi";
import { imageKeyToUrl } from "@/lib/images/imageKeyToUrl";

function formatStartAt(startsAt: string) {
  const d = new Date(startsAt);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function toThumb(p: { user_id: number; name: string; image_key: string | null }): ParticipantOut & {
  avatarUrl: string | null;
} {
  return {
    user_id: p.user_id,
    name: p.name,
    bio: null,
    image_key: p.image_key,
    avatarUrl: imageKeyToUrl(p.image_key),
  };
}

export function EventCard({ event }: { event: EventListItem }) {
  const participantsPreview = event.participants_preview?.filter(Boolean) ?? null;
  const thumbs =
    participantsPreview && participantsPreview.length > 0
      ? participantsPreview.slice(0, 4).map((p) => ({
          user_id: p.user_id,
          name: p.name,
          bio: p.bio,
          image_key: p.image_key,
          avatarUrl: imageKeyToUrl(p.image_key),
        }))
      : [toThumb({ user_id: event.owner.user_id, name: event.owner.name, image_key: event.owner.image_key })];

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5"
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[24px] bg-gray-100">
        {imageKeyToUrl(event.image_key) ? (
          <img src={imageKeyToUrl(event.image_key) ?? undefined} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
        )}
      </div>

      <h2 className="mb-3 text-2xl font-bold tracking-tight">{event.title}</h2>

      <div className="space-y-1 text-sm text-gray-700">
        <p>・場所 {event.place}</p>
        <p>・時間 {formatStartAt(event.starts_at)}</p>
        <p>
          ・参加者 {event.joined_count}/{event.capacity}人
        </p>
      </div>

      <div className="mt-4 flex -space-x-2">
        {thumbs.slice(0, 4).map((member) => (
          <div
            key={member.user_id}
            className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-gray-100"
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
        ))}
      </div>
    </Link>
  );
}

