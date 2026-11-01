import type { Assessment, HazardStatus, Plan } from "./types";

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 } as const;

// Same rules as the server's planService, used only for optimistic updates.
export function derivePlan(assessment: Assessment): Plan {
  const hazards = assessment.rooms.flatMap((r) => r.hazards);
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

export function withHazardStatus(
  assessment: Assessment,
  hazardId: string,
  status: HazardStatus,
): Assessment {
  const next: Assessment = {
    ...assessment,
    rooms: assessment.rooms.map((room) => ({
      ...room,
      hazards: room.hazards.map((h) =>
        h.id === hazardId
          ? { ...h, status, resolvedAt: status === "resolved" ? new Date().toISOString() : null }
          : h,
      ),
    })),
  };
  return { ...next, plan: derivePlan(next) };
}
