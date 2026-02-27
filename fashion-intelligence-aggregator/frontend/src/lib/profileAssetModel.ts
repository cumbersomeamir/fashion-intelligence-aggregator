import mongoose, { Schema } from "mongoose";

const profileAssetSchema = new Schema(
  {
    assetId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    sessionId: { type: String, index: true },
    imageUrl: { type: String, required: true },
    source: { type: String, default: "chat-profile-upload" },
  },
  { timestamps: true }
);

profileAssetSchema.index({ userId: 1, createdAt: -1 });
profileAssetSchema.index({ sessionId: 1, createdAt: -1 });

export const ProfileAssetModel =
  mongoose.models?.ProfileAsset ??
  mongoose.model("ProfileAsset", profileAssetSchema, "ProfileAssets");
