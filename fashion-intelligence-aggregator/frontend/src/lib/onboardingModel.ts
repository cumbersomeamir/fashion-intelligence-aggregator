import mongoose, { Schema } from "mongoose";

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

/** Onboarding document — stores profile preferences by userId after Google login */
const onboardingSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    displayName: { type: String },
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
    profile_image: { type: String },
  },
  { timestamps: true }
);

export const OnboardingModel =
  mongoose.models?.Onboarding ?? mongoose.model("Onboarding", onboardingSchema);
