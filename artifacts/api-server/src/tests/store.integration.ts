// Runs against the development API/MongoDB only. Creates two synthetic accounts
// and orders, then removes only its own data and restores reserved stock.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, requireSecrets } from "../lib/db";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

if (process.env.NODE_ENV === "production") throw new Error("Development tests only.");
const base = "http://localhost:80/api";
let checks = 0;
const ids: string[] = [];
const suffix = randomBytes(6).toString("hex");
const password = "WaslSyntheticTest123!";
const emails = [`wasl-test-a-${suffix}@example.invalid`, `wasl-test-b-${suffix}@example.invalid`];
// Response bodies intentionally remain inside this process; never log JWTs/gift links.
async function api(path: string, status: number, body?: unknown, token?: string) {
  const response = await fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, status, `${path.replace(/\/gifts\/.*/, "/gifts/[redacted]")} expected ${status}`);
  checks++;
  // Assertions below validate the endpoint-specific shapes at runtime.
  return response.json() as Promise<any>;
}

try {
  await connectDB();
  const products = await api("/products", 200);
  assert.ok(products.length > 0);
  const product = products[0];
  const productId = product.id;
  assert.ok(Number.isSafeInteger(product.price) && product.moods.length > 0);
  assert.deepEqual(await api(`/products/${productId}`, 200), product);
  await api("/products/not-an-id", 400);
  await api("/products/ffffffffffffffffffffffff", 404);
  await api("/auth/signup", 400, { name: "Test", email: "bad", password });
  await api("/auth/signup", 400, { name: "Test", email: emails[0], password: "short" });
  await api("/auth/signup", 400, { name: " ", email: emails[0], password });
  await api("/auth/signup", 400, { name: "Test", email: emails[0], password: "a".repeat(73) });
  const a = await api("/auth/signup", 201, { name: "Synthetic Sender", email: emails[0]!.toUpperCase(), password });
  ids.push(a.user.id);
  assert.deepEqual(Object.keys(a.user).sort(), ["email", "id", "name"]);
  assert.equal(a.user.email, emails[0]);
  assert.equal("passwordHash" in a, false);
  const claims = jwt.verify(a.token, requireSecrets().jwtKey) as jwt.JwtPayload;
  assert.equal(claims.exp! - claims.iat!, 7 * 24 * 60 * 60);
  await api("/auth/signup", 409, { name: "Duplicate", email: emails[0], password });
  // Race on the second test account must produce exactly one success.
  const race = await Promise.all([1, 2].map(async () => {
    const response = await fetch(`${base}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Synthetic Other", email: emails[1], password }) });
    return { status: response.status, body: await response.json() as any };
  }));
  assert.deepEqual(race.map(r => r.status).sort(), [201, 409]);
  checks++;
  const b = race.find(r => r.status === 201)!.body;
  ids.push(b.user.id);
  const stored = await User.findById(a.user.id).select("+passwordHash").lean();
  assert.ok(stored);
  assert.ok(await bcrypt.compare(password, stored.passwordHash));
  assert.ok(bcrypt.getRounds(stored.passwordHash) >= 10);
  assert.notEqual(stored.passwordHash, password);
  assert.equal((await User.findById(a.user.id).lean())?.passwordHash, undefined);
  await api("/auth/login", 200, { email: emails[0], password });
  assert.equal((await api("/auth/login", 401, { email: emails[0], password: "wrong" })).error, "Invalid email or password");
  assert.equal((await api("/auth/login", 401, { email: `missing-${suffix}@example.invalid`, password })).error, "Invalid email or password");
  assert.equal((await api("/auth/login", 401, { email: "invalid", password })).error, "Invalid email or password");
  assert.deepEqual((await api("/auth/me", 200, undefined, a.token)).user, a.user);
  await api("/orders", 401);
  await api("/orders", 401, {}, undefined);
  await api("/auth/me", 401, undefined, "malformed");
  const sign = (sub: string, expiresIn: number) => jwt.sign({}, requireSecrets().jwtKey, { subject: sub, issuer: "wasl", audience: "wasl-store", expiresIn });
  await api("/orders", 401, undefined, sign(a.user.id, -1));
  await api("/orders", 401, undefined, sign("invalid", 60));
  await api("/orders", 401, undefined, sign("ffffffffffffffffffffffff", 60));
  await api("/orders", 401, undefined, jwt.sign({}, "different-signing-key", { subject: a.user.id, expiresIn: 60 }));
  assert.deepEqual(await api("/orders", 200, undefined, a.token), []);
  const delivery = { name: "Synthetic Delivery", phone: "55555555", governorate: "Hawalli", area: "Test Area", block: "1", street: "Test Street", building: "1" };
  const input = { items: [{ productId, quantity: 2 }], delivery };
  await api("/orders", 400, { ...input, items: [{ productId, quantity: 0 }] }, a.token);
  await api("/orders", 400, { ...input, items: [{ productId, quantity: 1.5 }] }, a.token);
  await api("/orders", 400, { ...input, items: [{ productId, quantity: 100 }] }, a.token);
  await api("/orders", 400, { ...input, items: [...input.items, ...input.items] }, a.token);
  await api("/orders", 400, { ...input, delivery: { ...delivery, phone: "12345678" } }, a.token);
  await api("/orders", 400, { ...input, items: [{ productId: "not-id", quantity: 1 }] }, a.token);
  const before = await Product.findById(productId).lean();
  await api("/orders", 400, { ...input, items: [...input.items, { productId: "ffffffffffffffffffffffff", quantity: 1 }] }, a.token);
  assert.equal((await Product.findById(productId).lean())?.stock, before!.stock, "Failed order rolls back stock");
  const giftInput = { ...input, couponCode: "WASL10", isGift: true, giftTo: "Synthetic Recipient", giftMessage: "A thoughtful test gift <script>alert(1)</script>", giftWrap: "Eid", userId: b.user.id, total: 1, price: 1 };
  await api("/orders", 400, { ...giftInput, giftMessage: "x".repeat(301) }, a.token);
  await api("/orders", 400, { ...giftInput, giftWrap: "Other" }, a.token);
  await api("/orders", 400, { ...giftInput, giftTo: "" }, a.token);
  const gift = await api("/orders", 201, giftInput, a.token);
  assert.equal(gift.subtotalFils, product.price * 2);
  assert.equal(gift.discountFils, Math.round(product.price * 2 / 10));
  assert.equal(gift.totalFils, gift.subtotalFils - gift.discountFils);
  assert.match(gift.giftToken, /^[a-f0-9]{64}$/);
  assert.equal(gift.giftToken.includes(a.user.id), false);
  assert.equal(gift.giftToken.includes(gift.id), false);
  const other = await api("/orders", 201, { ...input, isGift: false, giftTo: "ignored", giftMessage: "ignored", giftWrap: "Classic", user: a.user.id, total: 1 }, b.token);
  assert.equal(other.totalFils, product.price * 2);
  assert.equal("giftToken" in other, false);
  const nonGift = await Order.findById(other.id).lean();
  assert.ok(nonGift);
  assert.equal(nonGift.giftToken, undefined);
  assert.equal(nonGift.giftMessage, undefined);
  assert.equal(nonGift.giftTo, undefined);
  assert.equal(nonGift.status, "pending");
  assert.equal(nonGift.delivery, undefined, "Private delivery omitted by default");
  const aOrders = await api(`/orders?userId=${b.user.id}`, 200, undefined, a.token);
  const bOrders = await api(`/orders?userId=${a.user.id}`, 200, undefined, b.token);
  assert.deepEqual(aOrders.map((o: { id: string }) => o.id), [gift.id]);
  assert.deepEqual(bOrders.map((o: { id: string }) => o.id), [other.id]);
  const publicGift = await api(`/gifts/${gift.giftToken}`, 200);
  assert.deepEqual(Object.keys(publicGift).sort(), ["giftMessage", "giftWrap", "items", "senderName"]);
  assert.deepEqual(publicGift, { senderName: "Synthetic Sender", giftMessage: giftInput.giftMessage, giftWrap: "Eid", items: [product.name] });
  for (const forbidden of ["price", "total", "email", "delivery", "quantity", "user", "_id", "giftTo", "giftToken"]) assert.equal(Object.hasOwn(publicGift, forbidden), false);
  await api("/gifts/invalid", 404);
  await api(`/gifts/${"0".repeat(64)}`, 404);
  await api(`/gifts/${other.id}`, 404);
  // Verify a well-formed token cannot expose a non-gift record even if present.
  const nongiftToken = randomBytes(32).toString("hex");
  await Order.updateOne({ _id: other.id }, { $set: { giftToken: nongiftToken } });
  await api(`/gifts/${nongiftToken}`, 404);
  await Order.updateOne({ _id: other.id }, { $unset: { giftToken: 1 } });
  const currentStock = (await Product.findById(productId).lean())!.stock;
  if (currentStock < 99) await api("/orders", 400, { ...input, items: [{ productId, quantity: currentStock + 1 }] }, a.token);
  else {
    // Use a temporary synthetic product to test zero stock, leaving existing catalog untouched.
    const unavailable = await Product.create({ name: "Synthetic stock check", description: "Temporary integration test", category: "Desk", features: [], price: 1000, stock: 0, moods: ["Focus"], image: "https://example.invalid/test.png" });
    try { await api("/orders", 400, { ...input, items: [{ productId: String(unavailable._id), quantity: 1 }] }, a.token); }
    finally { await Product.deleteOne({ _id: unavailable._id }); }
  }
  assert.equal((await Product.findById(productId).lean())!.stock, currentStock);
  process.stdout.write(`PASS: ${checks} API cases plus database privacy, password hashing, JWT lifetime, ownership, gift allowlist and atomic stock assertions.\n`);
} finally {
  // Only the two accounts generated by this invocation can be affected.
  const users = await User.find({ email: { $in: emails } }).select("_id").lean();
  const cleanupIds = [...ids, ...users.map(u => String(u._id))];
  await mongoose.connection.transaction(async session => {
    const orders = await Order.find({ user: { $in: cleanupIds } }).session(session);
    for (const order of orders) for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
    }
    await Order.deleteMany({ user: { $in: cleanupIds } }).session(session);
    await User.deleteMany({ _id: { $in: cleanupIds } }).session(session);
  });
  await mongoose.disconnect();
}
