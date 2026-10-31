import { HttpError } from "../lib/httpError.js";
import { IdParamsSchema } from "../schemas/api.js";

/** A malformed id is reported like a missing one (404), so ids can't be probed. */
export function idParam(params: unknown): string {
  const parsed = IdParamsSchema.safeParse(params);
  if (!parsed.success) throw new HttpError("NOT_FOUND");
  return parsed.data.id;
}
