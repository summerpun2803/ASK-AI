// src/server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PORT, FRONTEND_ORIGIN } from "./config.js";
import { connectToMongo } from "./services/db.js";

dotenv.config();

await connectToMongo(); // important: ensure DB connected before starting

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({ origin: [FRONTEND_ORIGIN, "http://localhost:3000", "*", "https://ask-ai-cyan.vercel.app/"] }));

// mounted routers
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
console.log("now");
app.use("/auth", authRoutes);
app.use("/", chatRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "ok", db: true, openai_enabled: !!process.env.OPENAI_API_KEY }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
