import mongoose, { Schema } from "mongoose";

const reelSchema = new Schema(
  {
    reelId: { type: String, required: true, unique: true, index: true },
    creator: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    priceHint: { type: String, required: true },
    baseImageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: Date.now, index: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const ReelModel =
  mongoose.models?.ReelItem ?? mongoose.model("ReelItem", reelSchema, "ReelItems");
