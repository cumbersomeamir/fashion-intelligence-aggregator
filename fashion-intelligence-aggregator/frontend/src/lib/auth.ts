/**
 * Auth helpers for login flow.
 * - Skip: localStorage flag for bypass (dev/demo)
 * - Google: will use tokens/session when integrated
 */

const AUTH_SKIPPED_KEY = "auth_skipped";
const AUTH_GOOGLE_TOKEN_KEY = "auth_google_token"; // placeholder for future

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(AUTH_SKIPPED_KEY) === "true" ||
    !!localStorage.getItem(AUTH_GOOGLE_TOKEN_KEY)
  );
}

export function setAuthSkipped(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_SKIPPED_KEY, "true");
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_SKIPPED_KEY);
  localStorage.removeItem(AUTH_GOOGLE_TOKEN_KEY);
}
