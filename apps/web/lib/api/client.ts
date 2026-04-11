import { getIdToken } from "../auth/getIdToken";
import { getAccessToken } from "../auth/getAccessToken";

type TokenType = "id" | "access";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  tokenType: TokenType = "id"
) {
  const token =
    tokenType === "id"
      ? await getIdToken()
      : await getAccessToken();

  if (!token) throw new Error("Not authenticated");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}