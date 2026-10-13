import mongoose from "mongoose";

let pending: Promise<typeof mongoose> | undefined;

// Only environment secrets are accepted. Never log connection errors/URIs.
export function requireSecrets(): { uri: string; jwtKey: string } {
  const uri = process.env.MONGODB_URI;
  const jwtKey = process.env.JWT_SECRET;
  if (!uri?.trim()) throw new Error("Missing MONGODB_URI. Add it in Tools > Secrets.");
  if (!jwtKey?.trim()) throw new Error("Missing JWT_SECRET. Add it in Tools > Secrets.");
  return { uri, jwtKey };
}

export async function connectDB(): Promise<typeof mongoose> {
  const { uri } = requireSecrets();
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!pending) {
    pending = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      autoIndex: true,
    }).catch(() => {
      throw new Error("MongoDB unavailable. Check Atlas connection settings.");
    }).finally(() => {
      // Cache only an in-flight connection, not a resolved promise after disconnect.
      pending = undefined;
    });
  }
  return pending;
}
