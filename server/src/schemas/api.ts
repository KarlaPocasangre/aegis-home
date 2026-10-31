import { z } from "zod";
import { HAZARD_STATUSES, ROOM_TYPES } from "./enums.js";

// Request inputs (docs/API_SPECS.md §2). Every route validates with these before touching the DB.

export const HouseholdTokenSchema = z.uuid();

export const IdParamsSchema = z.object({ id: z.uuid() });

export const CreateHouseholdBodySchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  language: z
    .string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
    .default("es"),
});

export const RoomUploadFieldsSchema = z.object({
  roomType: z.enum(ROOM_TYPES),
});

export const PatchHazardBodySchema = z.object({
  status: z.enum(HAZARD_STATUSES),
});

export type CreateHouseholdBody = z.infer<typeof CreateHouseholdBodySchema>;
export type RoomUploadFields = z.infer<typeof RoomUploadFieldsSchema>;
export type PatchHazardBody = z.infer<typeof PatchHazardBodySchema>;
