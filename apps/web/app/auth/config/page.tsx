import { redirect } from "next/navigation";

/**
 * `/auth/config` は FastAPI のエンドポイント用パス。
 * ブラウザでこの URL を開いたり、Cognito のリダイレクト先を誤設定すると Next が 404 になるため、
 * アプリ内の画面へ戻す。
 */
export default function AuthConfigRedirectPage() {
  redirect("/events");
}
