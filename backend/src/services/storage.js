// src/services/storage.js
import { getDb } from "./db.js";
import { ObjectId } from "mongodb";
import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Collections:
 * - users: { username, passwordHash, created_at }
 * - sessions: { token, username, created_at }
 * - chats: { username, role, prompt, reply, image_url, type, created_at, meta, message_id }
 */

export async function createUser(username, passwordHash) {
  const db = getDb();
  const doc = { username, passwordHash, created_at: new Date() };
  const res = await db.collection("users").insertOne(doc);
  return res.insertedId;
}

export async function getUser(username) {
  const db = getDb();
  return await db.collection("users").findOne({ username });
}

export async function createSession(token, username) {
  const db = getDb();
  const doc = { token, username, created_at: new Date() };
  await db.collection("sessions").insertOne(doc);
  return doc;
}

export async function getUserByToken(token) {
  const db = getDb();
  const s = await db.collection("sessions").findOne({ token });
  return s ? s.username : null;
}

export async function updateUserToken(username, token) {
  const db = getDb();
  // Upsert session document
  await db.collection("sessions").insertOne({ token, username, created_at: new Date() });
  return token;
}

export async function clearSession(token) {
  const db = getDb();
  await db.collection("sessions").deleteOne({ token });
}

export async function appendChatEntry(username, entry) {
  const db = getDb();
  const doc = {
    username,
    ...entry,
    created_at: entry.created_at ? new Date(entry.created_at) : new Date()
  };
  await db.collection("chats").insertOne(doc);
  return doc;
}

export async function loadUserChat(username, limit = 1000) {
  const db = getDb();
  const cursor = db.collection("chats")
    .find({ username })
    .sort({ created_at: -1 })
    .limit(limit);
  const docs = await cursor.toArray();
  // return in ascending order (oldest first)
  return docs.reverse();
}

export async function getChatsForUser(username, opts = {}) {
  return await loadUserChat(username, opts.limit || 1000);
}

export async function uploadBufferToCloudinary(bufferOrStream, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    // If we were given a Buffer, create a streamifier read stream; otherwise assume it's already a stream
    if (Buffer.isBuffer(bufferOrStream)) {
      streamifier.createReadStream(bufferOrStream).pipe(uploadStream);
    } else if (bufferOrStream && typeof bufferOrStream.pipe === "function") {
      bufferOrStream.pipe(uploadStream);
    } else {
      reject(new Error("uploadBufferToCloudinary expects a Buffer or Readable stream"));
    }
  });
}
