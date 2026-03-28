"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { ensureAmplifyConfigured } from "@/lib/auth/amplify";

/** Cognito ID トークン。POST /auth/sync の Bearer に使う。 */
export async function getIdToken(): Promise<string | null> {
  try {
    await ensureAmplifyConfigured();
  } catch {
    return null;
  }

  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
