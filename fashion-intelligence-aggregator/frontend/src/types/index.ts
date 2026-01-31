export type Topic =
  | "Fit"
  | "Budget"
  | "Occasion"
  | "Style"
  | "Fabric"
  | "Comparison"
  | "TryOn";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  fabricComposition: Record<string, number>;
  sizeChart: { size: string; chest?: number; waist?: number; hips?: number; length?: number }[];
  textureTags: string[];
  occasionTags: string[];
  styleTags: string[];
  images: string[];
}

export interface Profile {
  measurements?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
  stylePrefs?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  topic?: Topic;
  citations?: string[];
}
