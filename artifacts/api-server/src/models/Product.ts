import mongoose, { type Model, type InferSchemaType } from "mongoose";
const { Schema, model, models } = mongoose;

export const moods = ["Cozy", "Energetic", "Focus", "Celebrate"] as const;
const productSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  description: { type: String, required: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0, max: 100000000, validate: Number.isSafeInteger },
  image: { type: String, required: true, validate: (v: string) => /^https?:\/\//.test(v) },
  stock: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  moods: [{ type: String, enum: moods }],
  category: { type: String, required: true, maxlength: 80 },
  features: [{ type: String, maxlength: 300 }],
  tag: { type: String, maxlength: 80 },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

export type ProductData = InferSchemaType<typeof productSchema>;
export const Product = (models.Product as Model<ProductData>) || model("Product", productSchema);

export function publicProduct(p: ProductData & { _id: unknown }) {
  return {
    id: String(p._id), name: p.name, description: p.description, price: p.price,
    image: p.image, stock: p.stock, moods: p.moods, category: p.category,
    features: p.features, ...(p.tag ? { tag: p.tag } : {}), createdAt: p.createdAt,
  };
}
