import { rateLimit } from "express-rate-limit";
import { HttpError } from "../lib/httpError.js";

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

// Limits from docs/API_SPECS.md §1 (per IP; requires `trust proxy` behind Render).
export const globalLimiter = () => limiter(15 * 60_000, 100);
export const createHouseholdLimiter = () => limiter(60 * 60_000, 10);
export const analysisLimiter = () => limiter(60_000, 5);
