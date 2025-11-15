// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { createUser, getUser, createSession, updateUserToken, getUserByToken } from "../services/storage.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });
    const key = username.trim().toLowerCase();

    // check exists
    const existing = await getUser(key);
    if (existing) return res.status(400).json({ error: "username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    await createUser(key, passwordHash);

    const token = uuidv4();
    await createSession(token, key);
    
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    return res.json({ token, username: key });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username and password required" });
    const key = username.trim().toLowerCase();
    const user = await getUser(key);
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = uuidv4();
    await createSession(token, key);

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    return res.json({ token, username: key });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "login failed" });
  }
});

export default router;
