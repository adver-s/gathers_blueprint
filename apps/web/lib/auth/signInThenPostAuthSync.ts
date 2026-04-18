import { signIn } from "aws-amplify/auth";
import { postAuthSyncAndNavigate } from "@/lib/auth/postAuthSync";

type ReplaceRouter = { replace: (href: string) => void };

function isAlreadySignedInError(err: unknown): boolean {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return msg.toLowerCase().includes("already a signed in");
}

/**
 * signIn 後に postAuthSync。Amplify が「すでにサインイン済み」のときは signIn をスキップして同期のみ行う。
 */
export async function signInThenPostAuthSync(
  router: ReplaceRouter,
  creds: { username: string; password: string },
  opts?: { displayName?: string },
): Promise<void> {
  try {
    await signIn({ username: creds.username, password: creds.password });
  } catch (e) {
    if (!isAlreadySignedInError(e)) throw e;
  }
  await postAuthSyncAndNavigate(router, opts);
}
