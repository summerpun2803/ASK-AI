  // src/middleware/auth.js
  import { getUserByToken } from "../services/storage.js";

  /**
   * Returns username or null
   */
  export async function getUserFromRequest(req) {
    const auth = req.get("Authorization");
    let token = null;
    if (auth && auth.startsWith("Bearer ")) token = auth.split(" ", 2)[1].trim();
    else if (req.cookies?.token) token = req.cookies.token;
    if (!token) return null;
    const username = await getUserByToken(token);
    return username || null;
  }

  export function requireAuth(req, res, next) {
    // returns a promise - we need to call getUserFromRequest and await
    getUserFromRequest(req).then(user => {
      if (!user) return res.status(401).json({ error: "unauthorized" });
      req.user = user;
      next();
    }).catch(err => {
      console.error("auth middleware error:", err);
      res.status(500).json({ error: "internal" });
    });
  }
