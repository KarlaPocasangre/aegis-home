import { randomUUID } from "node:crypto";
import type { Db } from "../lib/prisma.js";
import type { CreateHouseholdBody } from "../schemas/api.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function createHouseholdService(db: Db, ttlDays: number) {
  return {
    async create(input: CreateHouseholdBody) {
      const now = new Date();
      // Lazy retention cleanup (docs/DATA_MODEL.md §7); cascades to assessments, rooms, hazards.
      await db.household.deleteMany({ where: { expiresAt: { lte: now } } });
      const household = await db.household.create({
        data: {
          accessToken: randomUUID(),
          name: input.name ?? null,
          language: input.language,
          expiresAt: new Date(now.getTime() + ttlDays * DAY_MS),
          assessments: { create: {} },
        },
        select: { accessToken: true, expiresAt: true, assessments: { select: { id: true } } },
      });
      return {
        token: household.accessToken,
        expiresAt: household.expiresAt,
        assessmentId: household.assessments[0]?.id ?? null,
      };
    },

    /** Household id for a live (non-expired) token, or null. */
    async idForToken(token: string): Promise<string | null> {
      const household = await db.household.findFirst({
        where: { accessToken: token, expiresAt: { gt: new Date() } },
        select: { id: true },
      });
      return household?.id ?? null;
    },

    async summary(householdId: string) {
      const household = await db.household.findUniqueOrThrow({
        where: { id: householdId },
        select: {
          name: true,
          expiresAt: true,
          assessments: {
            orderBy: { createdAt: "asc" },
            select: { id: true, createdAt: true, _count: { select: { rooms: true } } },
          },
        },
      });
      return {
        name: household.name,
        expiresAt: household.expiresAt,
        assessments: household.assessments.map((a) => ({
          id: a.id,
          createdAt: a.createdAt,
          roomCount: a._count.rooms,
        })),
      };
    },

    async remove(householdId: string) {
      await db.household.delete({ where: { id: householdId } });
    },
  };
}

export type HouseholdService = ReturnType<typeof createHouseholdService>;
