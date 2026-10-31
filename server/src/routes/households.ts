import { Router, type RequestHandler } from "express";
import { householdIdOf } from "../middlewares/tokenAuth.js";
import { CreateHouseholdBodySchema } from "../schemas/api.js";
import type { HouseholdService } from "../services/householdService.js";

export function householdsRouter(
  households: HouseholdService,
  auth: RequestHandler,
  createLimiter: RequestHandler,
) {
  const router = Router();

  router.post("/", createLimiter, async (req, res) => {
    const body = CreateHouseholdBodySchema.parse(req.body ?? {});
    res.status(201).json(await households.create(body));
  });

  router.get("/me", auth, async (_req, res) => {
    res.json(await households.summary(householdIdOf(res)));
  });

  router.delete("/me", auth, async (_req, res) => {
    await households.remove(householdIdOf(res));
    res.status(204).end();
  });

  return router;
}
