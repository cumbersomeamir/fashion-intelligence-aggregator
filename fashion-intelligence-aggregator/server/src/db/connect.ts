import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Add it to server/.env.local");
}

export async function connectMongo(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
