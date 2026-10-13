// Controlled handler tests supplement the real MongoDB/API integration suite.
// No existing products are deleted to exercise empty/error branches.
import assert from "node:assert/strict";
import { mock } from "node:test";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { Product } from "../models/Product";
import router from "../routes/products";

if (process.env.NODE_ENV === "production") throw new Error("Development tests only.");
async function invoke(path: string, id?: string) {
  const layer = (router as any).stack.find((l: any) => l.route?.path === path);
  let status = 200;
  let body: unknown;
  const res = {
    status(s: number) { status = s; return res; },
    json(b: unknown) { body = b; return res; },
  };
  await layer.route.stack[0].handle({ params: { id } }, res, () => {});
  return { status, body };
}

try {
  await connectDB();
  await mongoose.disconnect();
  await connectDB();
  assert.equal(mongoose.connection.readyState, 1, "Helper reconnects after disconnect");
  const empty = mock.method(Product, "find", (() => ({ sort: () => ({ lean: async () => [] }) })) as any);
  assert.deepEqual(await invoke("/products"), { status: 200, body: [] });
  empty.mock.restore();
  const failedQuery = mock.method(Product, "find", (() => { throw new Error("Simulated query failure"); }) as any);
  assert.deepEqual(await invoke("/products"), { status: 503, body: { error: "Products are temporarily unavailable. Please try again." } });
  failedQuery.mock.restore();
  await mongoose.disconnect();
  let attempts = 0;
  mock.method(mongoose, "connect", (async () => {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 10));
    throw new Error("Simulated driver connection failure");
  }) as any);
  const requests = await Promise.allSettled([connectDB(), connectDB()]);
  assert.equal(attempts, 1, "Concurrent calls share one pending connection");
  for (const r of requests) {
    assert.equal(r.status, "rejected");
    if (r.status === "rejected") assert.equal(r.reason.message, "MongoDB unavailable. Check Atlas connection settings.");
  }
  assert.equal((await invoke("/products")).status, 503);
  assert.equal((await invoke("/products/:id", "7761736c0000000000000001")).status, 503);
  assert.ok(attempts > 1, "Failed connections can be retried");
  process.stdout.write("PASS: Empty catalog, query failure, connection failure, shared connection, and reconnect handler tests (controlled mocks).\n");
} finally {
  mock.restoreAll();
  await mongoose.disconnect();
}
