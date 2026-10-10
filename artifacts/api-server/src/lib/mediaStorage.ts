import { Storage, type File } from "@google-cloud/storage";

// Replit's managed sidecar supplies credentials; no application keys are used.
const endpoint = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${endpoint}/token`,
    type: "external_account",
    credential_source: {
      url: `${endpoint}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export async function findPublicMedia(asset: string): Promise<File | null> {
  const paths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);
  if (!paths.length) throw new Error("Public media storage is not configured.");
  for (const path of paths) {
    const [bucket, ...prefix] = path.replace(/^\/+/, "").split("/");
    if (!bucket) continue;
    const file = storage.bucket(bucket).file([...prefix, "wasl", asset].join("/"));
    const [exists] = await file.exists();
    if (exists) return file;
  }
  return null;
}
