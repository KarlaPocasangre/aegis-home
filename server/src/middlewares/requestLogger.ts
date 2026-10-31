import type { RequestHandler } from "express";

// Log policy (docs/SECURITY.md §5): method, path, status, duration. No bodies, query or headers.
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.once("finish", () => {
    const ms = Math.round(performance.now() - start);
    console.log(`[http] ${req.method} ${req.baseUrl}${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
};
