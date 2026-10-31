import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";
import type { Db } from "../lib/prisma.js";
import { RegionSchema } from "../schemas/ai.js";
import {
  toApiEnum,
  toDbEnum,
  type HazardStatusValue,
  type RoomTypeValue,
} from "../schemas/enums.js";
import { buildPlan } from "./planService.js";
import type { AnalysisResult } from "./visionService.js";

const MAX_ROOMS_PER_ASSESSMENT = 8;
const MAX_ROOMS_PER_HOUSEHOLD_PER_DAY = 20;

const roomInclude = { hazards: { orderBy: { aiId: "asc" } } } satisfies Prisma.RoomInclude;
type RoomRow = Prisma.RoomGetPayload<{ include: typeof roomInclude }>;
type HazardRow = RoomRow["hazards"][number];

function toHazardDto(h: HazardRow) {
  const region = RegionSchema.safeParse(h.region); // stored data is re-checked before rendering
  return {
    id: h.id,
    aiId: h.aiId,
    labelEn: h.labelEn,
    labelEs: h.labelEs,
    severity: toApiEnum(h.severity),
    descriptionEs: h.descriptionEs,
    fixEs: h.fixEs,
    costEstimateUsd: h.costEstimateUsd,
    confidence: h.confidence,
    region: region.success ? region.data : null,
    status: toApiEnum(h.status),
    resolvedAt: h.resolvedAt,
  };
}

function toRoomDto(r: RoomRow) {
  return {
    id: r.id,
    type: toApiEnum(r.type),
    source: toApiEnum(r.source),
    imageWidth: r.imageWidth,
    imageHeight: r.imageHeight,
    createdAt: r.createdAt,
    hazards: r.hazards.map(toHazardDto),
  };
}

export type RoomDto = ReturnType<typeof toRoomDto>;

// Every query is scoped by household; anything else is reported as 404 (docs/API_SPECS.md §1).
export function createAssessmentService(db: Db) {
  async function requireOwned(householdId: string, assessmentId: string) {
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, householdId },
      select: { id: true, _count: { select: { rooms: true } } },
    });
    if (!assessment) throw new HttpError("NOT_FOUND");
    return assessment;
  }

  return {
    async create(householdId: string) {
      return db.assessment.create({
        data: { householdId },
        select: { id: true, createdAt: true },
      });
    },

    async get(householdId: string, assessmentId: string) {
      const assessment = await db.assessment.findFirst({
        where: { id: assessmentId, householdId },
        include: { rooms: { orderBy: { createdAt: "asc" }, include: roomInclude } },
      });
      if (!assessment) throw new HttpError("NOT_FOUND");
      const rooms = assessment.rooms.map(toRoomDto);
      return {
        id: assessment.id,
        createdAt: assessment.createdAt,
        rooms,
        plan: buildPlan(rooms.flatMap((r) => r.hazards)),
      };
    },

    /** Checked before analysis so a rejected upload never spends AI calls. */
    async ensureCanAddRoom(householdId: string, assessmentId: string) {
      const assessment = await requireOwned(householdId, assessmentId);
      if (assessment._count.rooms >= MAX_ROOMS_PER_ASSESSMENT) {
        throw new HttpError(
          "VALIDATION_ERROR",
          "Esta evaluación ya tiene el máximo de habitaciones",
        );
      }
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const today = await db.room.count({
        where: { createdAt: { gte: since }, assessment: { householdId } },
      });
      if (today >= MAX_ROOMS_PER_HOUSEHOLD_PER_DAY) throw new HttpError("RATE_LIMITED");
    },

    async addRoom(
      householdId: string,
      assessmentId: string,
      room: {
        type: RoomTypeValue;
        imageWidth: number;
        imageHeight: number;
        result: AnalysisResult;
      },
    ): Promise<RoomDto> {
      await requireOwned(householdId, assessmentId);
      // Nested create runs in one transaction: a room is never saved without its hazards.
      const created = await db.room.create({
        data: {
          assessmentId,
          type: toDbEnum(room.type),
          source: toDbEnum(room.result.source),
          imageWidth: room.imageWidth,
          imageHeight: room.imageHeight,
          hazards: {
            create: room.result.hazards.map((h) => ({
              aiId: h.id,
              labelEn: h.label_en,
              labelEs: h.label_es,
              severity: toDbEnum(h.severity),
              descriptionEs: h.description_es,
              fixEs: h.fix_es,
              costEstimateUsd: h.cost_estimate_usd,
              confidence: h.confidence,
              region: h.region ?? Prisma.JsonNull,
            })),
          },
        },
        include: roomInclude,
      });
      return toRoomDto(created);
    },

    async setHazardStatus(householdId: string, hazardId: string, status: HazardStatusValue) {
      const owned = await db.hazard.findFirst({
        where: { id: hazardId, room: { assessment: { householdId } } },
        select: { id: true },
      });
      if (!owned) throw new HttpError("NOT_FOUND");
      const updated = await db.hazard.update({
        where: { id: hazardId },
        data: { status: toDbEnum(status), resolvedAt: status === "resolved" ? new Date() : null },
        select: { id: true, status: true, resolvedAt: true },
      });
      return { ...updated, status: toApiEnum(updated.status) };
    },
  };
}

export type AssessmentService = ReturnType<typeof createAssessmentService>;
