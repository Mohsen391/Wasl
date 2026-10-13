import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]?.replace(/(\/(?:gifts?|gift)\/)[^/]+/g, "$1[redacted]"),
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as { status?: number }).status;
  res.status(status === 413 ? 413 : status === 400 ? 400 : 500).json({ error: status === 413 ? "Request is too large." : status === 400 ? "Invalid JSON request." : "Something went wrong. Please try again." });
});

export default app;
