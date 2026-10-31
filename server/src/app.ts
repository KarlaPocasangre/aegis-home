import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { healthRouter } from "./routes/health.js";

// Middleware order follows docs/SECURITY.md §3.
export function createApp(config: Pick<Config, "FRONTEND_URL">) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "X-Household-Token"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.use(healthRouter);
  app.use(globalLimiter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
