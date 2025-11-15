// src/services/db.js
import dotenv from "dotenv";
import { MONGO_URI } from "../config.js";
import { MONGO_DB } from "../config.js";
dotenv.config();
import { MongoClient } from "mongodb";

const uri = MONGO_URI;
const dbName = MONGO_DB || "asklumen";

if (!uri) throw new Error("MONGO_URI must be set in .env");

let client;
let db;

export async function connectToMongo() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  // ensure indexes
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("chats").createIndex({ username: 1, created_at: -1 });

  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not connected. Call connectToMongo() first.");
  return db;
}

export async function closeMongo() {
  if (client) await client.close();
  db = null;
}
