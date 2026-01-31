import type { Topic } from "@/types";

const KEYWORDS: Record<Topic, string[]> = {
  Fit: ["fit", "size", "measurement", "measurements", "body", "waist", "chest", "hips"],
  Budget: ["budget", "price", "cheap", "affordable", "cost", "expensive"],
  Occasion: ["occasion", "event", "wedding", "office", "casual", "formal", "party"],
  Style: ["style", "fashion", "look", "outfit", "aesthetic"],
  Fabric: ["fabric", "material", "cotton", "wool", "linen", "composition", "texture"],
  Comparison: ["compare", "comparison", "vs", "difference", "versus"],
  TryOn: ["try on", "try-on", "virtual", "how does it look", "fit me"],
};

export function detectTopicFromMessage(message: string): Topic {
  const lower = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(KEYWORDS) as [Topic, string[]][]) {
    if (keywords.some((k) => lower.includes(k))) return topic;
  }
  return "Style";
}

export const TOPICS: Topic[] = [
  "Fit",
  "Budget",
  "Occasion",
  "Style",
  "Fabric",
  "Comparison",
  "TryOn",
];
