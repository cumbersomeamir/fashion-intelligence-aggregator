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

export type FitPreference = "slim" | "regular" | "relaxed" | "oversized";
export type SleevePreference = "short" | "long" | "no preference";
export type LengthPreference = "cropped" | "standard" | "long";
export type BudgetSensitivity = "value" | "balanced" | "premium";
export type OccasionFrequency = "daily" | "occasional" | "rare";
export type Climate = "hot" | "moderate" | "cold";

export interface Profile {
  /** Body & fit data — powers Size & Measurement, Good Fit */
  measurements?: {
    height?: number;   // cm
    weight?: number;   // kg
    chest?: number;    // in
    waist?: number;    // in
    hips?: number;     // in
    shoulder?: number; // in, optional
    inseam?: number;   // in, optional
  };
  /** Fit preference (not style) */
  fitPreference?: FitPreference;
  sleevePreference?: SleevePreference;
  lengthPreference?: LengthPreference;
  /** Budget — powers Budget topic & recommendations */
  budgetTier?: string;           // e.g. "500-1000", "1000-3000", "3000+"
  budgetSensitivity?: BudgetSensitivity;
  /** Occasion — powers Occasion topic & ranking */
  occasions?: string[];         // work, casual, party, gym, travel, ethnic, formal
  occasionFrequency?: OccasionFrequency;
  /** Fabric — powers Fabric topic & product info */
  fabricPrefs?: string[];
  fabricSensitivities?: string[];
  /** Climate — fabric + layering logic */
  climate?: Climate;
  /** Brand affinity — cross-brand ranking */
  favoriteBrands?: string[];
  brandsToAvoid?: string[];
  /** Style tags */
  stylePrefs?: string[];
  /** Profile image URL (stored in S3, reference in MongoDB) */
  profile_image?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  topic?: Topic;
  citations?: string[];
}

/** User profile (profile page) — tied to Google auth userId */
export interface UserProfile {
  userId: string;
  displayName?: string;
  username?: string;
  profilePictureUrl?: string;
  tryOnCount?: number;
  followersCount?: number;
  followingCount?: number;
  wardrobeItems?: string[];
  likedItems?: string[];
  pinterestConnected?: boolean;
  /** Server-only; never returned to client */
  pinterestAccessToken?: string;
  pinterestRefreshToken?: string;
  onboardingCompleted?: boolean;
}

/** Pinterest board (stored in MongoDB, linked by userId) */
export interface PinterestBoard {
  boardId: string;
  name?: string;
  description?: string;
  pinCount: number;
  thumbnailUrl?: string;
  lastSyncedAt?: string;
}

/** Pinterest pin (stored in MongoDB, linked by userId) */
export interface PinterestPin {
  pinId: string;
  boardId: string;
  boardName?: string;
  imageUrl: string;
  link?: string;
  title?: string;
  description?: string;
  syncedAt?: string;
}
