import { Router, type IRouter } from "express";
import { findPublicMedia } from "../lib/mediaStorage";

const router: IRouter = Router();
const publicAssets = new Map([
  ["commercial.mp4", "video/mp4"],
  ["commercial-poster.jpg", "image/jpeg"],
]);

// Public brand assets only; allowlisting prevents access to private uploads.
router.get("/media/:asset", async (req, res): Promise<void> => {
  const asset = String(req.params.asset);
  const contentType = publicAssets.get(asset);
  if (!contentType) {
    res.sendStatus(404);
    return;
  }
  const file = await findPublicMedia(asset);
  if (!file) {
    res.sendStatus(404);
    return;
  }
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size);
  res.set({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  });
  let start = 0;
  let end = size - 1;
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    } else {
      start = -1;
    }
    if (start < 0 || start >= size || end < start) {
      res.status(416).set("Content-Range", `bytes */${size}`).end();
      return;
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set("Content-Length", String(end - start + 1));
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  const stream = file.createReadStream({ start, end });
  stream.on("error", (err) => {
    req.log.error({ err }, "Could not stream public media");
    if (!res.headersSent) res.sendStatus(500);
    else res.destroy();
  });
  res.on("close", () => stream.destroy());
  stream.pipe(res);
});

export default router;
