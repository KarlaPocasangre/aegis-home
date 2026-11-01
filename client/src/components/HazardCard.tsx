import { capitalize, formatCost } from "../lib/labels";
import type { Hazard } from "../lib/types";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  hazard: Hazard;
  number: number;
  active: boolean;
  onSelect: (id: string) => void;
}

// Model text is rendered as plain text only (docs/AI_INTEGRATION.md §8).
export function HazardCard({ hazard, number, active, onSelect }: Props) {
  const resolved = hazard.status === "resolved";
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(hazard.id)}
        aria-pressed={active}
        className={`w-full rounded-lg border bg-white p-4 text-left transition ${active ? "border-teal-600 ring-2 ring-teal-600/30" : "border-stone-200 hover:border-stone-300"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className={`font-semibold ${resolved ? "text-stone-500 line-through" : ""}`}>
            <span className="mr-2 text-stone-500">{number}.</span>
            {capitalize(hazard.labelEs)}
          </p>
          {resolved ? (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Resuelto
            </span>
          ) : (
            <SeverityBadge severity={hazard.severity} />
          )}
        </div>
        <p className="mt-2 text-sm text-stone-700">{hazard.descriptionEs}</p>
        <p className="mt-2 text-sm">
          <span className="font-semibold">Qué hacer: </span>
          {hazard.fixEs}
        </p>
        <p className="mt-1 text-sm text-stone-600">{formatCost(hazard.costEstimateUsd)}</p>
      </button>
    </li>
  );
}
