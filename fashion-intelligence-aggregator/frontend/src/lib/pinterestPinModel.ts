import mongoose, { Schema } from "mongoose";

const pinterestPinSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    pinId: { type: String, required: true },
    boardId: { type: String, required: true, index: true },
    boardName: { type: String },
    imageUrl: { type: String, required: true },
    link: { type: String },
    title: { type: String },
    description: { type: String },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One document per user per pin
pinterestPinSchema.index({ userId: 1, pinId: 1 }, { unique: true });

export const PinterestPinModel =
  mongoose.models?.PinterestPin ?? mongoose.model("PinterestPin", pinterestPinSchema);
