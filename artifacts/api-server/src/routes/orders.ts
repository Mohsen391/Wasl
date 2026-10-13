import { randomBytes, randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "../lib/db";
import { orderInput } from "../lib/validation";
import { Order, ownerOrder } from "../models/Order";
import { Product } from "../models/Product";
import { authenticate } from "../middlewares/auth";

const router: IRouter = Router();
router.get("/orders", authenticate, async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const orders = await Order.find({ user: res.locals.user.id }).sort({ createdAt: -1 }).lean();
    res.json(orders.map(ownerOrder));
  } catch { res.status(503).json({ error: "We couldn't load your orders. Please try again." }); }
});
const limit = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many orders. Please try again in a minute." } });
class InvalidOrder extends Error {}
router.post("/orders", authenticate, limit, async (req, res) => {
  res.set("Cache-Control", "no-store");
  const parsed = orderInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check your delivery details, quantities, and gift options." }); return; }
  const { items, delivery, couponCode, isGift, giftTo, giftMessage, giftWrap } = parsed.data;
  try {
    await connectDB();
    await Order.init();
    // Stock reservation and order persistence are atomic on Atlas. No partial stock loss on failure.
    const saved = await mongoose.connection.transaction(async session => {
      const lines: { product: mongoose.Types.ObjectId; name: string; price: number; quantity: number }[] = [];
      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, returnDocument: "before" },
        ).lean();
        if (!product) throw new InvalidOrder("One or more products are unavailable or have insufficient stock.");
        lines.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
      }
      const subtotalFils = lines.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discountFils = couponCode === "WASL10" ? Math.round(subtotalFils / 10) : 0;
      const [order] = await Order.create([{
        user: res.locals.user.id,
        orderReference: `WASL-${randomUUID().toUpperCase()}`,
        items: lines, delivery, subtotalFils, discountFils, total: subtotalFils - discountFils,
        status: "pending", isGift,
        ...(isGift ? { giftTo, giftMessage: giftMessage ?? "", giftWrap, giftToken: randomBytes(32).toString("hex"), senderName: res.locals.user.name } : {}),
      }], { session });
      return order!;
    });
    res.status(201).json({
      id: String(saved._id), orderReference: saved.orderReference, currency: "KWD",
      subtotalFils: saved.subtotalFils, discountFils: saved.discountFils, totalFils: saved.total,
      isGift: saved.isGift, ...(saved.isGift ? { giftToken: saved.giftToken } : {}),
    });
  } catch (err) {
    if (err instanceof InvalidOrder) { res.status(400).json({ error: err.message }); return; }
    res.status(503).json({ error: "We couldn't save your order. Your cart has not been cleared. Please try again." });
  }
});
export default router;
