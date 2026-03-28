"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { ensureAmplifyConfigured } from "@/lib/auth/amplify";

export async function getAccessToken(): Promise<string | null> {
  try {
    await ensureAmplifyConfigured();
  } catch {
    return null;
  }

  try {
    const session = await fetchAuthSession();
    // API は Cognito アクセストークン（token_use=access）を検証する。
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

