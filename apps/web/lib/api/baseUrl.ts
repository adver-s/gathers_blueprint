/**
 * FastAPI のオриジン。未設定だと fetch が Next 自身へ飛び
 * `/auth/config` が 404 HTML になるため、開発時だけ既定の API を使う。
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv !== undefined && fromEnv !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000";
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
  }
  return "";
}
