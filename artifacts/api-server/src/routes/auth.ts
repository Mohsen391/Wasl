import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { connectDB, requireSecrets } from "../lib/db";
import { signupInput, loginInput } from "../lib/validation";
import { User, publicUser } from "../models/User";
import { authenticate } from "../middlewares/auth";

const router: IRouter = Router();
router.use("/auth", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many account attempts. Please try again later." } });
function issueToken(id: string) {
  return jwt.sign({}, requireSecrets().jwtKey, { subject: id, algorithm: "HS256", expiresIn: "7d", issuer: "wasl", audience: "wasl-store" });
}
router.post("/auth/signup", limit, async (req, res) => {
  const parsed = signupInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Enter a name, valid email, and a password of at least 8 characters (maximum 72 bytes)." }); return; }
  try {
    await connectDB();
    await User.init(); // Ensure uniqueness before accepting accounts, including racing requests.
    const { name, email, password } = parsed.data;
    if (await User.exists({ email })) { res.status(409).json({ error: "An account with this email already exists." }); return; }
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: issueToken(String(user._id)), user: publicUser(user) });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) { res.status(409).json({ error: "An account with this email already exists." }); return; }
    res.status(503).json({ error: "We couldn't create your account. Please try again." });
  }
});
// A constant dummy hash evens out unknown-email and incorrect-password work.
const dummyHash = bcrypt.hashSync("not-a-real-account-password", 12);
router.post("/auth/login", limit, async (req, res) => {
  const parsed = loginInput.safeParse(req.body);
  if (!parsed.success) { res.status(401).json({ error: "Invalid email or password" }); return; }
  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
    const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? dummyHash);
    if (!user || !valid) { res.status(401).json({ error: "Invalid email or password" }); return; }
    res.json({ token: issueToken(String(user._id)), user: publicUser(user) });
  } catch {
    res.status(503).json({ error: "Login is temporarily unavailable. Please try again." });
  }
});
router.get("/auth/me", authenticate, (_req, res) => { res.set("Cache-Control", "no-store"); res.json({ user: res.locals.user }); });
export default router;
