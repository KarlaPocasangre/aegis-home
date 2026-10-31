import { z } from "zod";
import { ROOM_TYPES, SEVERITIES } from "./enums.js";

// Source of truth for the Muse Spark contract (docs/AI_INTEGRATION.md §4.2).
// z.object strips unknown keys, so nothing unexpected passes through.

export const HazardSchema = z.object({
  id: z.string().regex(/^h\d{1,2}$/),
  label_en: z.string().min(2).max(60), // short noun phrase, used as the SAM prompt
  label_es: z.string().min(2).max(60),
  severity: z.enum(SEVERITIES),
  description_es: z.string().min(5).max(300),
  fix_es: z.string().min(5).max(300),
  cost_estimate_usd: z.number().min(0).max(5000),
  confidence: z.number().min(0).max(1),
});

export const SparkOutputSchema = z
  .object({
    room_type: z.enum(ROOM_TYPES),
    hazards: z.array(HazardSchema).max(8),
  })
  .refine((out) => new Set(out.hazards.map((h) => h.id)).size === out.hazards.length, {
    message: "hazard ids must be unique",
    path: ["hazards"],
  });

export const RegionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bbox"),
    points: z.array(z.number().min(0).max(1)).length(4),
  }),
  z.object({
    type: z.literal("polygon"),
    points: z
      .array(z.number().min(0).max(1))
      .min(6)
      .max(200)
      .refine((p) => p.length % 2 === 0, { message: "polygon needs an even number of values" }),
  }),
]);

export type SparkHazard = z.infer<typeof HazardSchema>;
export type SparkOutput = z.infer<typeof SparkOutputSchema>;
export type Region = z.infer<typeof RegionSchema>;
