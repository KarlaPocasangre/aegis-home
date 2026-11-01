import { capitalize, formatCost } from "../lib/labels";
import type { Hazard } from "../lib/types";
import { useT } from "../lib/i18n";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  hazard: Hazard;
  number: number;
  active: boolean;
  onSelect: (id: string) => void;
}

// Model text is rendered as plain text only (docs/AI_INTEGRATION.md §8). It is always Spanish,
// so it carries lang="es" for screen readers when the interface is in another language.
export function HazardCard({ hazard, number, active, onSelect }: Props) {
  const tr = useT();
  const resolved = hazard.status === "resolved";
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(hazard.id)}
        aria-pressed={active}
        className={`w-full rounded-lg border bg-white p-4 text-left transition dark:bg-white/[0.03] ${active ? "border-teal-600 ring-2 ring-teal-600/30 dark:border-mint/70 dark:ring-mint/20" : "border-stone-200 hover:border-stone-300 dark:border-white/10 dark:hover:border-white/25"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            className={`font-semibold ${resolved ? "text-stone-500 line-through" : "dark:text-white"}`}
          >
            <span className="mr-2 text-stone-500">{number}.</span>
            <span lang="es">{capitalize(hazard.labelEs)}</span>
          </p>
          {resolved ? (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              {tr.roomsView.resolved}
            </span>
          ) : (
            <SeverityBadge severity={hazard.severity} />
          )}
        </div>
        <p lang="es" className="mt-2 text-sm text-stone-700 dark:text-stone-300">
          {hazard.descriptionEs}
        </p>
        <p className="mt-2 text-sm dark:text-stone-200">
          <span className="font-semibold">{tr.roomsView.whatToDo} </span>
          <span lang="es">{hazard.fixEs}</span>
        </p>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {formatCost(hazard.costEstimateUsd)}
        </p>
      </button>
    </li>
  );
}
