/**
 * FastAPI のオリジン（または開発時の Next プロキシプレフィックス）。
 *
 * `next dev` では `app/api-proxy/[[...path]]/route.ts` が
 * `{origin}/api-proxy/*` → FastAPI へ転送し、**同一オリジン fetch** にする。
 * これで CORS やブラウザの Private Network Access 起因の `Failed to fetch` を避けやすくする。
 *
 * 本番・`next start` では `NEXT_PUBLIC_API_BASE_URL` の設定が必須。
 *
 * LAN で `next dev` を `http://192.168.x.x:3000` のみ開く場合も、プロキシは Next サーバーが
 * `INTERNAL_API_ORIGIN`（既定 `http://127.0.0.1:8000`）へ中継する。
 */
function isPrivateLanIpv4(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1") return false;
  const parts = host.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 192 && b === 168) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv !== undefined && fromEnv !== "") {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    return `${window.location.origin}/api-proxy`;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://${host}:8000`;
    }
    if (isPrivateLanIpv4(host)) {
      return `http://${host}:8000`;
    }
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000";
  }

  return "";
}
