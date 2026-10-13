import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "../lib/db";
import { Order } from "../models/Order";

const router: IRouter = Router();
const limit = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Please try again shortly." } });
router.get("/gifts/:token", limit, async (req, res) => {
  res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" });
  const missing = () => res.status(404).json({ error: "This gift could not be found. Please check the link with its sender." });
  if (!/^[a-f0-9]{64}$/.test(String(req.params.token))) { missing(); return; }
  try {
    await connectDB();
    const gift = await Order.findOne({ giftToken: req.params.token, isGift: true }).select("senderName giftMessage giftWrap items.name -_id").lean();
    if (!gift) { missing(); return; }
    // Public bearer link: this explicit allowlist must never grow to include order/customer data.
    res.json({ senderName: gift.senderName ?? "Someone special", giftMessage: gift.giftMessage ?? "", giftWrap: gift.giftWrap, items: gift.items.map(i => i.name) });
  } catch { res.status(503).json({ error: "Your gift is temporarily unavailable. Please try again." }); }
});
export default router;
