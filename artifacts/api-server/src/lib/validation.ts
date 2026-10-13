import { z } from "zod";
import { wraps } from "../models/Order";

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const email = z.string().trim().toLowerCase().max(254).email();
// bcrypt only uses the first 72 UTF-8 bytes; reject rather than silently truncate.
const password = z.string().min(8).refine(v => Buffer.byteLength(v, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes");
export const signupInput = z.object({ name: text(2, 80), email, password });
export const loginInput = z.object({ email, password: z.string().min(1).max(200) });
export const objectId = z.string().regex(/^[a-f0-9]{24}$/i);
export const orderInput = z.object({
  items: z.array(z.object({ productId: objectId, quantity: z.number().int().min(1).max(99) })).min(1).max(20),
  delivery: z.object({
    name: text(2, 80),
    phone: z.string().trim().regex(/^[569][0-9]{7}$/),
    email: z.union([email, z.literal("")]).optional(),
    governorate: z.enum(["Al Asimah", "Hawalli", "Al Farwaniyah", "Mubarak Al-Kabeer", "Al Ahmadi", "Al Jahra"]),
    area: text(1, 100), block: text(1, 30), street: text(1, 100), building: text(1, 100),
    instructions: text(0, 500).optional(),
  }),
  couponCode: z.literal("WASL10").optional(),
  isGift: z.boolean().default(false),
  giftTo: text(1, 80).optional(),
  giftMessage: z.string().max(300).optional(),
  giftWrap: z.enum(wraps).optional(),
}).superRefine((v, ctx) => {
  if (v.isGift && (!v.giftTo || !v.giftWrap)) ctx.addIssue({ code: "custom", message: "Recipient and wrapping are required", path: ["giftTo"] });
  if (new Set(v.items.map(i => i.productId.toLowerCase())).size !== v.items.length) ctx.addIssue({ code: "custom", message: "Duplicate products", path: ["items"] });
});
