const API_BASE = "http://localhost:8000";

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

export async function saveProfile(profile: import("@/types").Profile): Promise<import("@/types").Profile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export interface ChatResponse {
  message: string;
  topic: string;
  citations: string[];
}

export async function sendChat(message: string, topic?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, topic }),
  });
  if (!res.ok) throw new Error("Failed to send chat");
  return res.json();
}
