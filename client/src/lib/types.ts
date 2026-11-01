// Mirrors the API contract in docs/API_SPECS.md §2.

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

export type RoomType = (typeof ROOM_TYPES)[number];
export type Severity = "low" | "medium" | "high";
export type HazardStatus = "pending" | "resolved";
export type AnalysisSource = "live" | "cached" | "mock";

export interface Region {
  type: "bbox" | "polygon";
  points: number[];
}

export interface Hazard {
  id: string;
  aiId: string;
  labelEn: string;
  labelEs: string;
  severity: Severity;
  descriptionEs: string;
  fixEs: string;
  costEstimateUsd: number;
  confidence: number;
  region: Region | null;
  status: HazardStatus;
  resolvedAt: string | null;
}

export interface Room {
  id: string;
  type: RoomType;
  source: AnalysisSource;
  imageWidth: number;
  imageHeight: number;
  createdAt: string;
  hazards: Hazard[];
  notice?: string;
}

export interface Plan {
  totalHazards: number;
  resolved: number;
  pendingCostUsd: number;
  orderedHazardIds: string[];
}

export interface Assessment {
  id: string;
  createdAt: string;
  rooms: Room[];
  plan: Plan;
}

export interface HouseholdSummary {
  name: string | null;
  expiresAt: string;
  assessments: { id: string; createdAt: string; roomCount: number }[];
}

export interface CreatedHousehold {
  token: string;
  expiresAt: string;
  assessmentId: string;
}
