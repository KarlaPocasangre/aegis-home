import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";

// body-parser tags its errors with a `type` field.
function fromBodyParser(err: unknown): HttpError | null {
  if (typeof err !== "object" || err === null || !("type" in err)) return null;
  if (err.type === "entity.too.large") return new HttpError("PAYLOAD_TOO_LARGE");
  if (err.type === "entity.parse.failed") return new HttpError("BAD_REQUEST");
  return null;
}

function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof ZodError) return new HttpError("VALIDATION_ERROR");
  return fromBodyParser(err) ?? new HttpError("INTERNAL_ERROR");
}

export const notFoundHandler: RequestHandler = () => {
  throw new HttpError("NOT_FOUND");
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const httpError = toHttpError(err);
  if (httpError.status >= 500) {
    // Log policy (docs/SECURITY.md §5): error name and message only, never bodies or tokens.
    const name = err instanceof Error ? err.name : "UnknownError";
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[error] ${req.method} ${req.path} ${httpError.status} ${name}: ${message}`);
  }
  res.status(httpError.status).json(httpError.toBody());
};
