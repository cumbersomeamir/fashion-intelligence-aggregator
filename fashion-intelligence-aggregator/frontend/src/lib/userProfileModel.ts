import mongoose, { Schema } from "mongoose";

const userProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    displayName: { type: String },
    username: { type: String },
    profilePictureUrl: { type: String },
    tryOnCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    wardrobeItems: [{ type: String }],
    likedItems: [{ type: String }],
    pinterestConnected: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserProfileModel =
  mongoose.models?.UserProfile ?? mongoose.model("UserProfile", userProfileSchema);
