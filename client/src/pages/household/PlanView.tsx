import { ActionPlan } from "../../components/ActionPlan";
import { EmptyState } from "../../components/EmptyState";
import { ViewTitle } from "../../components/ViewTitle";
import { roomPath } from "../../lib/router";
import type { Assessment, HazardStatus } from "../../lib/types";

interface Props {
  token: string;
  householdName: string | null;
  assessment: Assessment;
  pendingHazardId: string | null;
  statusError: string | null;
  onSetStatus: (hazardId: string, status: HazardStatus) => void;
}

export function PlanView({
  token,
  householdName,
  assessment,
  pendingHazardId,
  statusError,
  onSetStatus,
}: Props) {
  return (
    <div className="space-y-6">
      <ViewTitle subtitle={householdName ?? undefined}>Plan de acción</ViewTitle>
      {assessment.rooms.length === 0 ? (
        <EmptyState
          token={token}
          text="Aún no hay riesgos en el plan. Analice la foto de un espacio de la casa para empezar."
        />
      ) : (
        <ActionPlan
          assessment={assessment}
          pendingHazardId={pendingHazardId}
          onSetStatus={onSetStatus}
          photoHref={(roomId, hazardId) => roomPath(token, roomId, hazardId)}
        />
      )}
      {statusError && (
        <p role="alert" className="text-base text-red-700">
          {statusError}
        </p>
      )}
    </div>
  );
}
