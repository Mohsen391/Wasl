import mongoose, { type Model, type InferSchemaType } from "mongoose";
const { Schema, model, models } = mongoose;

export const wraps = ["Classic", "Eid", "Birthday", "Minimal"] as const;
const delivery = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  governorate: { type: String, required: true },
  area: { type: String, required: true },
  block: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: String, required: true },
  instructions: String,
}, { _id: false });
const line = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  quantity: { type: Number, required: true, min: 1, max: 99, validate: Number.isSafeInteger },
}, { _id: false });
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  orderReference: { type: String, required: true, unique: true },
  items: { type: [line], required: true },
  delivery: { type: delivery, required: true, select: false },
  total: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  subtotalFils: { type: Number, required: true, min: 0 },
  discountFils: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "paid"], default: "pending", required: true },
  isGift: { type: Boolean, default: false, required: true },
  giftTo: { type: String, maxlength: 80 },
  giftMessage: { type: String, maxlength: 300 },
  giftWrap: { type: String, enum: wraps },
  // Unset (never store null) to disable access while preserving the sparse unique index.
  giftToken: { type: String, unique: true, sparse: true },
  senderName: String,
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
export type OrderData = InferSchemaType<typeof schema>;
export const Order = (models.Order as Model<OrderData>) || model("Order", schema);
export function ownerOrder(o: OrderData & { _id: unknown }) {
  return {
    id: String(o._id), orderReference: o.orderReference,
    items: o.items.map(i => ({ product: String(i.product), name: i.name, price: i.price, quantity: i.quantity })),
    total: o.total, subtotalFils: o.subtotalFils, discountFils: o.discountFils,
    status: o.status, createdAt: o.createdAt, isGift: o.isGift,
    ...(o.isGift ? { giftToken: o.giftToken ?? null } : {}),
  };
}
