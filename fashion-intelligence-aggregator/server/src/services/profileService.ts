// In-memory profile store (replace with DB later)
let profile: Record<string, unknown> | null = null;

export function saveProfile(payload: Record<string, unknown>): Record<string, unknown> {
  profile = payload;
  return profile;
}

export function getProfile(): Record<string, unknown> | null {
  return profile;
}
