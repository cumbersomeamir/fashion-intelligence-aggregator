import "./loadEnv.js";
import express from "express";
import cors from "cors";
import { connectMongo } from "./db/connect.js";
import healthRoutes from "./routes/health.js";
import productRoutes from "./routes/products.js";
import profileRoutes from "./routes/profile.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = 8000;

app.use(cors({ origin: "http://localhost:3000" }));
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
