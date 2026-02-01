const API_BASE = "http://localhost:8000";

const CHAT_SESSION_KEY = "fia_chat_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  let id = window.localStorage.getItem(CHAT_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(CHAT_SESSION_KEY, id);
  }
  return id;
}

export async function fetchProducts(): Promise<import("@/types").Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(id: string): Promise<import("@/types").Product | null> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getProfile(): Promise<import("@/types").Profile | null> {
  const sessionId = getOrCreateSessionId();
  const res = await fetch(`${API_BASE}/api/profile?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return (Object.keys(data).length > 0 ? data : null) as import("@/types").Profile | null;
}

/** Upload profile image to S3 and return the public URL. Uses sessionId from localStorage. */
export async function uploadProfileImage(file: File): Promise<string> {
  const sessionId = getOrCreateSessionId();
  const form = new FormData();
  form.append("file", file);
  form.append("sessionId", sessionId);
  // Use same origin so deploy (Vercel etc.) always hits the correct API route
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(`${base}/api/upload-profile-image`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Upload failed");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function saveProfile(profile: import("@/types").Profile): Promise<import("@/types").Profile> {
  const sessionId = getOrCreateSessionId();
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...profile, sessionId }),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  const data = await res.json();
  const { sessionId: _s, ...saved } = data;
  return saved as import("@/types").Profile;
}

export interface ChatResponse {
  message: string;
  topic: string;
  citations: string[];
  text?: string;
}

/** Calls Next.js /api/chat (Gemini + Redis/memory). Uses persistent sessionId from localStorage. */
export async function sendChat(message: string, topic?: string, system?: string): Promise<ChatResponse> {
  const sessionId = getOrCreateSessionId();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      message,
      system: system ?? (topic ? `You are a fashion concierge. Current topic: ${topic}. Answer concisely.` : undefined),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? err?.error ?? "Failed to send chat");
  }
  const data = await res.json();
  return {
    message: data.message ?? data.text ?? "",
    topic: data.topic ?? "Style",
    citations: data.citations ?? [],
    text: data.text,
  };
}
