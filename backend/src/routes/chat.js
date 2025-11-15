// src/routes/chat.js
import express from "express";
import { getUserFromRequest, requireAuth } from "../middleware/auth.js";
import { generateText, generateImage } from "../services/aiService.js"; // ensure generateImage is exported
import { appendChatEntry, loadUserChat, uploadBufferToCloudinary } from "../services/storage.js";


const router = express.Router();

const ANONYMOUS_USER = "anonymous";

// POST /chat
router.post("/chat", async (req, res) => {
  const { prompt, want_image } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    let username = await getUserFromRequest(req);
    if (!username) username = ANONYMOUS_USER;

    const reply = await generateText(prompt);
    const entry = {
      message_id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
      role: "assistant",
      prompt,
      reply,
      image_url: null,
      created_at: new Date().toISOString(),
    };

    await appendChatEntry(username, entry);
    return res.json({ reply, image_url: entry.image_url, message_id: entry.message_id });
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({ error: "chat failed" });
  }
});


// POST /generate-image
router.post("/generate-image", async (req, res) => {
  const { prompt, size } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    let username = await getUserFromRequest(req);
    if (!username) username = ANONYMOUS_USER;

    const s = size && Number(size) ? Number(size) : 512;

    const gen = await generateImage(prompt, s);
    let buffer = gen;
    let mime = "image/png";
    
    let uploadResult;
    try {
      uploadResult = await uploadBufferToCloudinary(buffer, { folder: "my-uploads" });
    } catch (upErr) {
      console.error("Cloudinary upload failed:", upErr);
      return res.status(502).json({ error: "cloudinary upload failed", details: String(upErr) });
    }

    const imageUrl = uploadResult?.secure_url || uploadResult?.url || null;

    // 3) create and save chat entry
    const entry = {
      message_id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
      role: "assistant",
      type: "image",
      prompt,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    await appendChatEntry(username, entry);

    // 4) return URL to client
    return res.json({ image_url: imageUrl });
  } catch (err) {
    console.error("generate-image error:", err);
    return res.status(500).json({ error: "image generation failed" });
  }
});

// GET /chats (requires auth)
router.get("/chats", requireAuth, async (req, res) => {
  const username = req.user;
  const chats = await loadUserChat(username);
  return res.json({ username, chats: chats || [] });
});

export default router;
