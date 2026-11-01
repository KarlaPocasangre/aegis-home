// The API uses lowercase enum values, the DB uppercase (docs/DATA_MODEL.md §9).
// This file is the single place where that mapping lives.

export const ROOM_TYPES = [
  "bathroom",
  "kitchen",
  "bedroom",
  "living_room",
  "hallway",
  "stairs",
  "entrance",
  "outdoor",
  "other",
] as const;
export const SEVERITIES = ["low", "medium", "high"] as const;
export const HAZARD_STATUSES = ["pending", "resolved"] as const;
export const ANALYSIS_SOURCES = ["live", "cached", "mock"] as const;
/** Languages the model writes hazard text in (matches the client's language switcher). */
export const LANGUAGES = ["es", "pt", "en"] as const;

export type RoomTypeValue = (typeof ROOM_TYPES)[number];
export type SeverityValue = (typeof SEVERITIES)[number];
export type HazardStatusValue = (typeof HAZARD_STATUSES)[number];
export type AnalysisSourceValue = (typeof ANALYSIS_SOURCES)[number];
export type LanguageValue = (typeof LANGUAGES)[number];

export const toDbEnum = <T extends string>(value: T) => value.toUpperCase() as Uppercase<T>;
export const toApiEnum = <T extends string>(value: T) => value.toLowerCase() as Lowercase<T>;
