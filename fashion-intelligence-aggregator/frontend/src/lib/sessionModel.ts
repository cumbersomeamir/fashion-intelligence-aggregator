import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "assistant"] },
    content: { type: String, required: true },
    topic: { type: String },
    citations: { type: [String] },
    type: { type: String, enum: ["chat", "search", "try-on"] },
    searchQuery: { type: String },
    searchResults: { type: Schema.Types.Mixed },
    tryOnResultImage: { type: String },
    tryOnProduct: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "New Chat" },
    messages: { type: [chatMessageSchema], default: [] },
    currentTopic: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, lastActivityAt: -1 });

export const SessionModel =
  mongoose.models?.Session ??
  mongoose.model("Session", sessionSchema, "Sessions");
