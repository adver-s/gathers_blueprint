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

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}