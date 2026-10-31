import { Router, type RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { normalizeImage } from "../lib/imagePipeline.js";
import { concurrencyLimit } from "../middlewares/concurrency.js";
import { householdIdOf } from "../middlewares/tokenAuth.js";
import { uploadImage } from "../middlewares/upload.js";
import { RoomUploadFieldsSchema } from "../schemas/api.js";
import type { AssessmentService } from "../services/assessmentService.js";
import type { VisionService } from "../services/visionService.js";
import { idParam } from "./params.js";

const FALLBACK_NOTICE =
  "Resultado de ejemplo: el servicio de análisis no está disponible en este momento.";
const MAX_CONCURRENT_ANALYSES = 2;

export function assessmentsRouter(
  assessments: AssessmentService,
  vision: VisionService,
  analysisLimiter: RequestHandler,
) {
  const router = Router();

  router.post("/", async (_req, res) => {
    res.status(201).json(await assessments.create(householdIdOf(res)));
  });

  router.get("/:id", async (req, res) => {
    res.json(await assessments.get(householdIdOf(res), idParam(req.params)));
  });

  router.post(
    "/:id/rooms",
    analysisLimiter,
    concurrencyLimit(MAX_CONCURRENT_ANALYSES),
    uploadImage,
    async (req, res) => {
      const householdId = householdIdOf(res);
      const assessmentId = idParam(req.params);
      if (!req.file) throw new HttpError("VALIDATION_ERROR");
      const { roomType } = RoomUploadFieldsSchema.parse(req.body ?? {});

      await assessments.ensureCanAddRoom(householdId, assessmentId);
      const image = await normalizeImage(req.file.buffer);
      const result = await vision.analyze(image, roomType);
      console.log(`[analysis] source=${result.source} hazards=${result.hazards.length}`);

      const room = await assessments.addRoom(householdId, assessmentId, {
        type: roomType,
        imageWidth: image.width,
        imageHeight: image.height,
        result,
      });
      res.status(201).json(result.source === "live" ? room : { ...room, notice: FALLBACK_NOTICE });
    },
  );

  return router;
}
