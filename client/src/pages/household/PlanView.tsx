import { ActionPlan } from "../../components/ActionPlan";
import { EmptyState } from "../../components/EmptyState";
import { ShareLink } from "../../components/ShareLink";
import { ViewTitle } from "../../components/ViewTitle";
import { useT } from "../../lib/i18n";
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
  const p = useT().plan;
  return (
    <div className="space-y-6">
      <ViewTitle subtitle={householdName ?? undefined}>{p.title}</ViewTitle>
      {assessment.rooms.length === 0 ? (
        <EmptyState token={token} text={p.empty} />
      ) : (
        <ActionPlan
          assessment={assessment}
          pendingHazardId={pendingHazardId}
          onSetStatus={onSetStatus}
          photoHref={(roomId, hazardId) => roomPath(token, roomId, hazardId)}
        />
      )}
      {statusError && (
        <p role="alert" className="text-base text-red-300">
          {statusError}
        </p>
      )}
      {/* Sharing belongs with the plan the family will follow, not only in Settings. */}
      {assessment.rooms.length > 0 && <ShareLink token={token} />}
    </div>
  );
}
