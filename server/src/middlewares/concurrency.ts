import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";

/** Caps in-flight requests (memory uploads + sharp on a small instance); extra ones get 429. */
export function concurrencyLimit(max: number): RequestHandler {
  let active = 0;
  return (_req, res, next) => {
    if (active >= max) {
      res.setHeader("Retry-After", "5");
      throw new HttpError("RATE_LIMITED");
    }
    active++;
    res.once("close", () => active--);
    next();
  };
}
