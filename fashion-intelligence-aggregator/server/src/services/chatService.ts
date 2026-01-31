import { getProductById } from "./productService.js";

const TOPIC_KEYWORDS: Record<string, string[]> = {
  Fit: ["fit", "size", "measurement", "measurements", "body", "waist", "chest", "hips"],
  Budget: ["budget", "price", "cheap", "affordable", "cost", "expensive"],
  Occasion: ["occasion", "event", "wedding", "office", "casual", "formal", "party"],
  Style: ["style", "fashion", "look", "outfit", "aesthetic"],
  Fabric: ["fabric", "material", "cotton", "wool", "linen", "composition", "texture"],
  Comparison: ["compare", "comparison", "vs", "difference", "versus"],
  TryOn: ["try on", "try-on", "virtual", "how does it look", "fit me"],
};

export function inferTopic(message: string): string {
  const lower = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return topic;
  }
  return "Style";
}

export function getMockChatResponse(
  message: string,
  topic: string
): { response: string; topic: string; citations: string[] } {
  const product = getProductById("1");
  const citations: string[] = [];
  if (product) {
    citations.push(`Product: ${product.name} (${product.brand}) - $${product.price}`);
    citations.push(`Fabric: ${Object.entries(product.fabricComposition).map(([k, v]) => `${k} ${v}%`).join(", ")}`);
    citations.push(`Styles: ${product.styleTags.join(", ")}`);
  }

  const responses: Record<string, string> = {
    Fit: "Based on your measurements, I'd recommend checking our Size & Measurement module. We use your body data to suggest the best fit. The Classic Oxford Shirt comes in XS–XL with detailed size chart.",
    Budget: "I've pulled options that match your budget. Our aggregation spans multiple brands—you'll see Everlane, Uniqlo, COS, and Zara. Filter by price in Recommendations.",
    Occasion: "For that occasion, our recommendation engine considers occasion tags (casual, office, formal). Check the Recommendations module for ranked options.",
    Style: "Your style preferences are saved in Personalization. The concierge uses these to rank products—see Recommendations for 'why recommended' based on your style tags.",
    Fabric: "Product Info shows fabric composition and texture tags for each item. For example, the Classic Oxford is 100% cotton with a crisp, matte finish.",
    Comparison: "Use the Comparison module to stack products side by side. Select items from the grid to compare fabric, price, and size charts.",
    TryOn: "Head to the Try-On module for our virtual try-on experience. Slide to reveal the result—we use your profile for a personalized fit preview.",
  };

  const response = responses[topic] ?? "I can help with fit, budget, occasion, style, fabric, comparison, or try-on. Which would you like to explore?";
  return { response, topic, citations };
}
