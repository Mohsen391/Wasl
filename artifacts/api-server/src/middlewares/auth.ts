import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User, publicUser } from "../models/User";
import { connectDB, requireSecrets } from "../lib/db";
import { objectId } from "../lib/validation";

export const authenticate: RequestHandler = async (req, res, next) => {
  const match = req.headers.authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) { res.status(401).json({ error: "Please log in to continue." }); return; }
  let id: string;
  try {
    const claims = jwt.verify(match[1]!, requireSecrets().jwtKey, { algorithms: ["HS256"], issuer: "wasl", audience: "wasl-store" });
    if (typeof claims === "string" || !objectId.safeParse(claims.sub).success || !claims.exp) throw new Error("Invalid identity");
    id = claims.sub!;
  } catch {
    res.status(401).json({ error: "Your session has expired. Please log in again." }); return;
  }
  try {
    await connectDB();
    const user = await User.findById(id).select("name email").lean();
    if (!user) { res.status(401).json({ error: "Please log in again." }); return; }
    res.locals.user = publicUser(user);
    next();
  } catch {
    res.status(503).json({ error: "Accounts are temporarily unavailable. Please try again." });
  }
};
