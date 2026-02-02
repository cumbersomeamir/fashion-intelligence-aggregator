import "./loadEnv.js";
import express from "express";
import cors from "cors";
import { connectMongo } from "./db/connect.js";
import healthRoutes from "./routes/health.js";
import productRoutes from "./routes/products.js";
import profileRoutes from "./routes/profile.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
// Comma-separated list, e.g. "https://app.vercel.app,http://localhost:3000"
const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin or non-browser
      if (CORS_ORIGINS.includes(origin)) return cb(null, true);
      // Allow any Vercel deployment (production + preview) and localhost
      if (origin.endsWith(".vercel.app") || origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:")) {
        return cb(null, true);
      }
      console.warn("[CORS] Rejected origin:", origin, "allowed:", CORS_ORIGINS);
      return cb(null, false);
    },
  })
);
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
