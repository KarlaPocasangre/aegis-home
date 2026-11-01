import { linkHandler } from "../lib/router";
import { capitalize, formatCost, formatUsd, ROOM_LABELS } from "../lib/labels";
import type { Assessment, Hazard, HazardStatus, RoomType } from "../lib/types";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  assessment: Assessment;
  onSetStatus: (hazardId: string, status: HazardStatus) => void;
  pendingHazardId: string | null;
  /** Link to the hazard highlighted on its room's photo. */
  photoHref?: (roomId: string, hazardId: string) => string;
}

type Item = Hazard & { roomType: RoomType; roomId: string };

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
  const resolved = item.status === "resolved";
  return (
    <li className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-semibold ${resolved ? "text-stone-500 line-through" : ""}`}>
            {capitalize(item.labelEs)}
          </p>
          {!resolved && <SeverityBadge severity={item.severity} />}
        </div>
        <p className="mt-1 text-sm text-stone-700">{item.fixEs}</p>
        <p className="mt-1 text-xs text-stone-500">
          {ROOM_LABELS[item.roomType]} · {formatCost(item.costEstimateUsd)}
        </p>
        {photoHref && (
          <a
            href={photoHref}
            onClick={linkHandler(photoHref)}
            className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-900"
          >
            Ver en la foto
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${resolved ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50" : "bg-teal-700 text-white hover:bg-teal-800"}`}
      >
        {resolved ? "Deshacer" : "Ya lo arreglé"}
      </button>
    </li>
  );
}

export function ActionPlan({ assessment, onSetStatus, pendingHazardId, photoHref }: Props) {
  const byId = new Map<string, Item>();
  for (const room of assessment.rooms) {
    for (const hazard of room.hazards)
      byId.set(hazard.id, { ...hazard, roomType: room.type, roomId: room.id });
  }
  const pending = assessment.plan.orderedHazardIds
    .map((id) => byId.get(id))
    .filter((h): h is Item => h !== undefined);
  const resolved = [...byId.values()].filter((h) => h.status === "resolved");
  const { totalHazards, resolved: resolvedCount, pendingCostUsd } = assessment.plan;
  const progress = totalHazards === 0 ? 0 : Math.round((resolvedCount / totalHazards) * 100);

  if (totalHazards === 0) {
    return (
      <p className="text-stone-600">
        Aún no hay riesgos en el plan. Suba una foto de un espacio de la casa para empezar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">
            {resolvedCount} de {totalHazards} riesgos resueltos
          </p>
          <p className="text-sm text-stone-600">
            Costo pendiente aprox.:{" "}
            <span className="font-semibold">{formatUsd(pendingCostUsd)}</span>
          </p>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del plan"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">Por hacer, en orden de prioridad</h3>
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
          <h3 className="mb-2 font-semibold">Ya resueltos</h3>
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
