import dns from "node:dns";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Use Google DNS so SRV lookup for MongoDB Atlas succeeds (avoids ECONNREFUSED on some networks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });
