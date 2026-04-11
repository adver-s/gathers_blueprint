import { getIdToken } from "../auth/getIdToken";
import { getAccessToken } from "../auth/getAccessToken";
import { getApiBaseUrl } from "./baseUrl";

type TokenType = "id" | "access";

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  tokenType: TokenType = "id"
): Promise<T> {
  const token =
    tokenType === "id"
      ? await getIdToken()
      : await getAccessToken();

  if (!token) throw new Error("Not authenticated");

  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  if (!base || !url.startsWith("http")) {
    throw new Error(
      "API の URL が未設定です。NEXT_PUBLIC_API_BASE_URL を設定するか、localhost / LAN で開いてください。",
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(
        `API に接続できません（${url}）。API が起動しているか、CORS に ${typeof window !== "undefined" ? window.location.origin : "フロントのオリジン"} を含めてください。`,
      );
    }
    throw e;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}