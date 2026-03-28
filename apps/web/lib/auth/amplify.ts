"use client";

import { Amplify } from "aws-amplify";
import { getApiBaseUrl } from "@/lib/api/baseUrl";

type CognitoConfigResponse = {
  userPoolId: string;
  clientId: string;
  region: string;
};

let amplifyConfiguredPromise: Promise<void> | null = null;

const AUTH_CONFIG_TIMEOUT_MS = 15_000;

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function fetchAuthConfig(): Promise<CognitoConfigResponse> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "API の URL が未設定です。NEXT_PUBLIC_API_BASE_URL を設定するか、localhost/127.0.0.1 で開いてください。",
    );
  }

  const res = await fetch(`${base}/auth/config`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    // クロスオリジンで cookie は不要。include だと CORS が厳しくなることがある。
    credentials: "omit",
    signal: timeoutSignal(AUTH_CONFIG_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch /auth/config: ${res.status}`);
  }

  return res.json();
}

export async function ensureAmplifyConfigured() {
  if (typeof window === "undefined") return; // safeguard for accidental server import
  if (amplifyConfiguredPromise) return amplifyConfiguredPromise;

  const run = (async () => {
    const cfg = await fetchAuthConfig();

    // aws-amplify typings differ across versions; keep it flexible.
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: cfg.userPoolId,
          userPoolClientId: cfg.clientId,
          region: cfg.region,
        },
      },
    } as unknown as Record<string, unknown>);
  })();

  amplifyConfiguredPromise = run.catch((err) => {
    amplifyConfiguredPromise = null;
    throw err;
  });

  return amplifyConfiguredPromise;
}

