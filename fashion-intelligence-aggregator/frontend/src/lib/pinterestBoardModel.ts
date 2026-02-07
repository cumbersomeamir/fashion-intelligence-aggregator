import mongoose, { Schema } from "mongoose";

const pinterestBoardSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    boardId: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    pinCount: { type: Number, default: 0 },
    thumbnailUrl: { type: String },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One document per user per board
pinterestBoardSchema.index({ userId: 1, boardId: 1 }, { unique: true });

export const PinterestBoardModel =
  mongoose.models?.PinterestBoard ??
  mongoose.model("PinterestBoard", pinterestBoardSchema);
