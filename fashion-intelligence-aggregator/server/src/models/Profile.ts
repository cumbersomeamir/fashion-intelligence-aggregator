import mongoose, { Schema } from "mongoose";

/** Body & fit measurements (cm / kg / in) */
const measurementsSchema = new Schema(
  {
    height: { type: Number },
    weight: { type: Number },
    chest: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    shoulder: { type: Number },
    inseam: { type: Number },
  },
  { _id: false }
);

/** Profile document for personalization — matches frontend Profile type */
const profileSchema = new Schema(
  {
    /** Client session ID (localStorage) — unique per device/session */
    sessionId: { type: String, required: true, unique: true },
    measurements: { type: measurementsSchema },
    fitPreference: { type: String, enum: ["slim", "regular", "relaxed", "oversized"] },
    sleevePreference: { type: String, enum: ["short", "long", "no preference"] },
    lengthPreference: { type: String, enum: ["cropped", "standard", "long"] },
    budgetTier: { type: String },
    budgetSensitivity: { type: String, enum: ["value", "balanced", "premium"] },
    occasions: [{ type: String }],
    occasionFrequency: { type: String, enum: ["daily", "occasional", "rare"] },
    fabricPrefs: [{ type: String }],
    fabricSensitivities: [{ type: String }],
    climate: { type: String, enum: ["hot", "moderate", "cold"] },
    favoriteBrands: [{ type: String }],
    brandsToAvoid: [{ type: String }],
    stylePrefs: [{ type: String }],
    /** Profile image URL (S3 or CDN) — easy to reference for try-on, avatar, etc. */
    profile_image: { type: String },
  },
  { timestamps: true }
);

export const ProfileModel =
  mongoose.models?.Profile ?? mongoose.model("Profile", profileSchema);
