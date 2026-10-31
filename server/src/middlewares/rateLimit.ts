import { rateLimit } from "express-rate-limit";
import { HttpError } from "../lib/httpError.js";

// Limits from docs/API_SPECS.md §1 (per IP; requires `trust proxy` behind Render).
export interface RateLimits {
  globalPer15Min: number;
  createHouseholdPerHour: number;
  analysisPerMinute: number;
}

export const DEFAULT_RATE_LIMITS: RateLimits = {
  globalPer15Min: 100,
  createHouseholdPerHour: 10,
  analysisPerMinute: 5,
};

function limiter(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      const error = new HttpError("RATE_LIMITED");
      res.status(error.status).json(error.toBody());
    },
  });
}

export function createLimiters(limits: RateLimits) {
  return {
    global: limiter(15 * 60_000, limits.globalPer15Min),
    createHousehold: limiter(60 * 60_000, limits.createHouseholdPerHour),
    analysis: limiter(60_000, limits.analysisPerMinute),
  };
}
