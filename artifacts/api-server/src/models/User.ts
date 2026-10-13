import mongoose, { type Model, type InferSchemaType } from "mongoose";
const { Schema, model, models } = mongoose;

const schema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
export type UserData = InferSchemaType<typeof schema>;
export const User = (models.User as Model<UserData>) || model("User", schema);
export function publicUser(user: { _id: unknown; name: string; email: string }) {
  return { id: String(user._id), name: user.name, email: user.email };
}
