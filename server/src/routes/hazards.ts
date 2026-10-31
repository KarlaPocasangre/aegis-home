import { Router } from "express";
import { householdIdOf } from "../middlewares/tokenAuth.js";
import { PatchHazardBodySchema } from "../schemas/api.js";
import type { AssessmentService } from "../services/assessmentService.js";
import { idParam } from "./params.js";

export function hazardsRouter(assessments: AssessmentService) {
  const router = Router();

  router.patch("/:id", async (req, res) => {
    const { status } = PatchHazardBodySchema.parse(req.body ?? {});
    res.json(await assessments.setHazardStatus(householdIdOf(res), idParam(req.params), status));
  });

  return router;
}
