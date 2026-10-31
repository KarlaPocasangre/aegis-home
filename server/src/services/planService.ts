import type { HazardStatusValue, SeverityValue } from "../schemas/enums.js";

export interface PlanHazard {
  id: string;
  severity: SeverityValue;
  confidence: number;
  status: HazardStatusValue;
  costEstimateUsd: number;
}

export interface Plan {
  totalHazards: number;
  resolved: number;
  pendingCostUsd: number;
  orderedHazardIds: string[];
}

const SEVERITY_RANK: Record<SeverityValue, number> = { high: 0, medium: 1, low: 2 };

// Derived, never stored (docs/DATA_MODEL.md §5).
export function buildPlan(hazards: readonly PlanHazard[]): Plan {
  const pending = hazards.filter((h) => h.status === "pending");
  const pendingCost = pending.reduce((sum, h) => sum + h.costEstimateUsd, 0);
  return {
    totalHazards: hazards.length,
    resolved: hazards.length - pending.length,
    pendingCostUsd: Math.round(pendingCost * 100) / 100,
    orderedHazardIds: [...pending]
      .sort(
        (a, b) =>
          SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.confidence - a.confidence,
      )
      .map((h) => h.id),
  };
}
