import mongoose from "mongoose";
import { connectDB } from "./lib/db";
import { Product } from "./models/Product";
import { samples } from "./seed-data";
import { logger } from "./lib/logger";

try {
  if (process.env.NODE_ENV === "production") throw new Error("Run seed against development MongoDB only.");
  await connectDB();
  await Product.init();
  const inserted = await mongoose.connection.transaction(async session => {
    if (await Product.countDocuments().session(session)) return false;
    // Deterministic IDs also prevent duplicate catalogues from racing seed runs.
    await Product.insertMany(samples.map((p, i) => ({
      ...p, _id: new mongoose.Types.ObjectId(`7761736c00000000000000${(i + 1).toString(16).padStart(2, "0")}`),
    })), { session });
    return true;
  });
  logger.info({ inserted, count: await Product.countDocuments() }, inserted ? "Wasl samples seeded" : "Products already exist; seed skipped without changes");
} catch (error) {
  logger.error({ message: error instanceof Error ? error.message : "Seed failed" }, "Unable to seed Wasl products");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
