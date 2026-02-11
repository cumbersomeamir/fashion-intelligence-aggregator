import type { Session } from "next-auth";

/**
 * Canonical userId for DB lookups. Use email (stable across sessions) over id.
 * Ensures we find profiles created with either.
 */
export function getSessionUserId(session: Session | null): string | null {
  if (!session?.user) return null;
  const email = session.user.email;
  if (email) return email;
  return (session.user as { id?: string }).id ?? null;
}
