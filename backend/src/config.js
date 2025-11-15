import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
export const GROK_API_KEY = process.env.GROK_API_KEY || null;
export const GROK_CHAT_MODEL = process.env.GROK_CHAT_MODEL || "gpt-4o-mini";
export const DATA_DIR = process.env.DATA_DIR || "./data";
export const SECRET_KEY = process.env.SECRET_KEY || "dev-secret";
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_DB = process.env.MONGO_DB || "asklumen";
export const HF_TOKEN = process.env.HF_TOKEN || null;
