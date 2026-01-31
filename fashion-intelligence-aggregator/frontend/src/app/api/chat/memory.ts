/**
 * In-memory fallback when REDIS_URL is not set (e.g. local dev).
 * Keys: chat:{sessionId}:history, chat:{sessionId}:summary
 * TTL not enforced in memory; cleared on process restart.
 */
const store = new Map<string, string>();

export const memoryStore = {
  async get(key: string): Promise<string | null> {
    return store.get(key) ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    store.set(key, value);
  },
};
