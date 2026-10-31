import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Config } from "./config/env.js";
import type { Db } from "./lib/prisma.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { createLimiters, DEFAULT_RATE_LIMITS, type RateLimits } from "./middlewares/rateLimit.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { tokenAuth } from "./middlewares/tokenAuth.js";
import { assessmentsRouter } from "./routes/assessments.js";
import { hazardsRouter } from "./routes/hazards.js";
import { healthRouter } from "./routes/health.js";
import { householdsRouter } from "./routes/households.js";
import { createAssessmentService } from "./services/assessmentService.js";
import { createHouseholdService } from "./services/householdService.js";
import type { VisionService } from "./services/visionService.js";

export interface AppDeps {
  config: Pick<Config, "FRONTEND_URL" | "HOUSEHOLD_TTL_DAYS" | "NODE_ENV">;
  db: Db;
  vision: VisionService;
  rateLimits?: Partial<RateLimits>;
}

// Middleware order follows docs/SECURITY.md §3.
export function createApp({ config, db, vision, rateLimits }: AppDeps) {
  const households = createHouseholdService(db, config.HOUSEHOLD_TTL_DAYS);
  const assessments = createAssessmentService(db);
  const auth = tokenAuth(households);
  const limiters = createLimiters({ ...DEFAULT_RATE_LIMITS, ...rateLimits });

  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  if (config.NODE_ENV !== "test") app.use(requestLogger);
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
  app.use(limiters.global);

  app.use("/api/households", householdsRouter(households, auth, limiters.createHousehold));
  app.use("/api/assessments", auth, assessmentsRouter(assessments, vision, limiters.analysis));
  app.use("/api/hazards", auth, hazardsRouter(assessments));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
