import { linkHandler } from "../lib/router";
import { useT } from "../lib/i18n";
import { capitalize, formatCost, formatUsd, roomLabel } from "../lib/labels";
import type { ContentLanguage, Assessment, Hazard, HazardStatus, RoomType } from "../lib/types";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  assessment: Assessment;
  onSetStatus: (hazardId: string, status: HazardStatus) => void;
  pendingHazardId: string | null;
  /** Link to the hazard highlighted on its room's photo. */
  photoHref?: (roomId: string, hazardId: string) => string;
}

type Item = Hazard & { roomType: RoomType; roomId: string; language: ContentLanguage };

function ActionItemRow({
  item,
  busy,
  onToggle,
  photoHref,
}: {
  item: Item;
  busy: boolean;
  onToggle: () => void;
  photoHref?: string;
}) {
  const p = useT().plan;
  const resolved = item.status === "resolved";
  return (
    <li className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-semibold ${resolved ? "text-stone-400 line-through" : ""}`}>
            <span lang={item.language}>{capitalize(item.labelEs)}</span>
          </p>
          {!resolved && <SeverityBadge severity={item.severity} />}
        </div>
        <p lang={item.language} className="mt-1 text-sm text-stone-300">
          {item.fixEs}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          {roomLabel(item.roomType)} · {formatCost(item.costEstimateUsd)}
        </p>
        {photoHref && (
          <a
            href={photoHref}
            onClick={linkHandler(photoHref)}
            className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-mint underline underline-offset-4 hover:text-mint"
          >
            {p.seePhoto}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${resolved ? "border border-white/15 bg-white/5 text-stone-200 hover:bg-white/10" : "bg-mint text-ink hover:bg-mint-soft"}`}
      >
        {resolved ? p.undo : p.fixed}
      </button>
    </li>
  );
}

export function ActionPlan({ assessment, onSetStatus, pendingHazardId, photoHref }: Props) {
  const p = useT().plan;
  const byId = new Map<string, Item>();
  for (const room of assessment.rooms) {
    for (const hazard of room.hazards)
      byId.set(hazard.id, {
        ...hazard,
        roomType: room.type,
        roomId: room.id,
        language: room.language,
      });
  }
  const pending = assessment.plan.orderedHazardIds
    .map((id) => byId.get(id))
    .filter((h): h is Item => h !== undefined);
  const resolved = [...byId.values()].filter((h) => h.status === "resolved");
  const { totalHazards, resolved: resolvedCount, pendingCostUsd } = assessment.plan;
  const progress = totalHazards === 0 ? 0 : Math.round((resolvedCount / totalHazards) * 100);

  if (totalHazards === 0) {
    return <p className="text-stone-400">{p.emptyShort}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white/[0.04] p-4 ring-1 ring-white/10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">{p.progress(resolvedCount, totalHazards)}</p>
          <p className="text-sm text-stone-400">
            {p.pendingCost} <span className="font-semibold">{formatUsd(pendingCostUsd)}</span>
          </p>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={p.progressAria}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">{p.todo}</h3>
          <ol className="space-y-2">
            {pending.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                busy={pendingHazardId === item.id}
                onToggle={() => onSetStatus(item.id, "resolved")}
                photoHref={photoHref?.(item.roomId, item.id)}
              />
            ))}
          </ol>
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">{p.done}</h3>
          <ul className="space-y-2">
            {resolved.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                busy={pendingHazardId === item.id}
                onToggle={() => onSetStatus(item.id, "pending")}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
