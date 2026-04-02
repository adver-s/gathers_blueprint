import { redirect } from "next/navigation";

/** 旧 URL / ブックマーク用。一覧は /events に統一。 */
export default function MeetPage() {
  redirect("/events");
}
