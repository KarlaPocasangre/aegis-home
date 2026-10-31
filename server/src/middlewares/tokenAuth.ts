import type { RequestHandler, Response } from "express";
import { HttpError } from "../lib/httpError.js";
import { HouseholdTokenSchema } from "../schemas/api.js";
import type { HouseholdService } from "../services/householdService.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      householdId?: string;
    }
  }
}

// The token travels in a header, never in the API URL, so it stays out of access logs.
export function tokenAuth(households: HouseholdService): RequestHandler {
  return async (req, res, next) => {
    const token = HouseholdTokenSchema.safeParse(req.get("X-Household-Token"));
    if (!token.success) throw new HttpError("UNAUTHORIZED");
    const householdId = await households.idForToken(token.data);
    if (!householdId) throw new HttpError("UNAUTHORIZED");
    res.locals.householdId = householdId;
    next();
  };
}

export function householdIdOf(res: Response): string {
  const id = res.locals.householdId;
  if (!id) throw new HttpError("UNAUTHORIZED");
  return id;
}
