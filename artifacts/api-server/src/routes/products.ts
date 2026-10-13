import { Router, type IRouter } from "express";
import { connectDB } from "../lib/db";
import { objectId } from "../lib/validation";
import { Product, publicProduct } from "../models/Product";

const router: IRouter = Router();
router.get("/products", async (_req, res) => {
  try {
    await connectDB();
    res.json((await Product.find().sort({ createdAt: 1, _id: 1 }).lean()).map(publicProduct));
  } catch { res.status(503).json({ error: "Products are temporarily unavailable. Please try again." }); }
});
router.get("/products/:id", async (req, res) => {
  if (!objectId.safeParse(req.params.id).success) { res.status(400).json({ error: "Invalid product ID." }); return; }
  try {
    await connectDB();
    const product = await Product.findById(req.params.id).lean();
    if (!product) { res.status(404).json({ error: "Product not found." }); return; }
    res.json(publicProduct(product));
  } catch { res.status(503).json({ error: "Products are temporarily unavailable. Please try again." }); }
});
export default router;
