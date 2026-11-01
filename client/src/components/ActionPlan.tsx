import { useEffect, useRef, useState } from "react";
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

/** How long a just-fixed item stays in place (with "Undo") before moving to the done list. */
const SETTLE_MS = 4000;
/** A second tap this soon after "fixed" is a double tap, not an undo. */
const DOUBLE_TAP_MS = 500;

function ActionItemRow({
  item,
  busy,
  justFixed = false,
  onToggle,
  photoHref,
}: {
  item: Item;
  busy: boolean;
  justFixed?: boolean;
  onToggle: () => void;
  photoHref?: string;
}) {
  const tr = useT();
  const p = tr.plan;
  const resolved = item.status === "resolved";
  return (
    <li
      data-hazard-row={item.id}
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${justFixed ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-ink-2"}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-semibold ${resolved ? "text-stone-400 line-through" : ""}`}>
            <span lang={item.language}>{capitalize(item.labelEs)}</span>
          </p>
          {!resolved && <SeverityBadge severity={item.severity} />}
        </div>
        {justFixed ? (
          <p className="mt-1 font-semibold text-emerald-300">{p.fixedDone}</p>
        ) : (
          <>
            <p lang={item.language} className="mt-1 text-sm text-stone-300">
              {item.fixEs}
            </p>
            {item.materialsEs?.length ? (
              <p className="mt-1 text-sm text-stone-300">
                <span className="font-semibold">{tr.common.materials} </span>
                <span lang={item.language}>{item.materialsEs.join(", ")}</span>
              </p>
            ) : null}
            <p className="mt-1 text-sm text-stone-400">
              {roomLabel(item.roomType)} · {formatCost(item.costEstimateUsd)}
            </p>
          </>
        )}
        {photoHref && !justFixed && (
          <a
            href={photoHref}
            onClick={linkHandler(photoHref)}
            className="mt-1 inline-flex min-h-12 items-center text-sm font-semibold text-mint underline underline-offset-4 hover:text-mint"
          >
            {p.seePhoto}
          </a>
        )}
      </div>
      {/* One button that swaps its label keeps keyboard focus in place after the tap; while
          saving it is aria-disabled, not disabled, since disabling drops focus. */}
      <button
        type="button"
        onClick={busy ? undefined : onToggle}
        aria-disabled={busy || undefined}
        className={`flex min-h-12 shrink-0 items-center rounded-lg px-4 text-base font-semibold aria-disabled:opacity-60 ${resolved ? "border border-white/15 bg-white/5 text-stone-200 hover:bg-white/10" : "bg-mint text-ink hover:bg-mint-soft"}`}
      >
        {resolved ? p.undo : p.fixed}
      </button>
    </li>
  );
}

export function ActionPlan({ assessment, onSetStatus, pendingHazardId, photoHref }: Props) {
  const p = useT().plan;
  // Just-fixed items stay where they were for a moment, so the tap has visible feedback
  // and an accidental tap can be undone on the spot.
  const [justFixed, setJustFixed] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [focusRow, setFocusRow] = useState<string | null>(null);
  // Undone items still resolved in the data until the queued request applies: shown as pending.
  const [reverting, setReverting] = useState<string[]>([]);
  const timers = useRef(new Map<string, number>());
  const fixedAt = useRef(new Map<string, number>());
  const lastOrder = useRef<string[]>([]);
  // Order stays by priority; the filter only narrows it to one room once the plan grows.
  const [roomFilter, setRoomFilter] = useState<string | null>(null);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (!focusRow) return;
    document.querySelector<HTMLElement>(`[data-hazard-row="${focusRow}"] button`)?.focus();
    setFocusRow(null);
  }, [focusRow]);

  useEffect(() => {
    if (reverting.length === 0) return;
    const status = new Map(assessment.rooms.flatMap((r) => r.hazards.map((h) => [h.id, h.status])));
    const keep = reverting.filter(
      (id) => status.get(id) === "resolved" && pendingHazardId !== null,
    );
    if (keep.length !== reverting.length) setReverting(keep);
  }, [assessment, pendingHazardId, reverting]);

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

  // The plan's order lists pending hazards only: put just-fixed ones back where they were.
  const order = [...assessment.plan.orderedHazardIds];
  for (const id of [...justFixed, ...reverting]) {
    if (order.includes(id)) continue;
    const at = lastOrder.current.indexOf(id);
    order.splice(at < 0 ? order.length : Math.min(at, order.length), 0, id);
  }
  lastOrder.current = order;

  const pending = order
    .map((id) => byId.get(id))
    .filter((h): h is Item => h !== undefined)
    .map((h) => (reverting.includes(h.id) ? { ...h, status: "pending" as const } : h));
  const resolved = [...byId.values()].filter(
    (h) => h.status === "resolved" && !justFixed.includes(h.id) && !reverting.includes(h.id),
  );
  // Rooms with something to show, labeled "Sala", "Sala 2"… when a type repeats.
  const typeCount = new Map<RoomType, number>();
  const roomOptions = assessment.rooms
    .filter((room) => room.hazards.length > 0)
    .map((room) => {
      const n = (typeCount.get(room.type) ?? 0) + 1;
      typeCount.set(room.type, n);
      return {
        id: room.id,
        label: n === 1 ? roomLabel(room.type) : `${roomLabel(room.type)} ${n}`,
      };
    });
  const activeFilter = roomOptions.some((o) => o.id === roomFilter) ? roomFilter : null;
  const inFilter = (item: Item) => activeFilter === null || item.roomId === activeFilter;
  const shownPending = pending.filter(inFilter);
  const shownResolved = resolved.filter(inFilter);

  const { totalHazards, resolved: resolvedCount, pendingCostUsd } = assessment.plan;
  const progress = totalHazards === 0 ? 0 : Math.round((resolvedCount / totalHazards) * 100);

  const justFixedNow = new Set(justFixed);

  // Runs from a timer: reads only refs, the DOM and state setters, never render-time values.
  const settle = (id: string) => {
    timers.current.delete(id);
    // If focus was on the row that moves away, hand it to its neighbor in the list.
    const row = document.querySelector(`[data-hazard-row="${id}"]`);
    if (row?.contains(document.activeElement)) {
      const neighbor = (row.nextElementSibling ?? row.previousElementSibling) as HTMLElement | null;
      setFocusRow(neighbor?.dataset.hazardRow ?? null);
    }
    setJustFixed((ids) => ids.filter((other) => other !== id));
  };

  const markFixed = (item: Item) => {
    fixedAt.current.set(item.id, Date.now());
    setReverting((ids) => ids.filter((other) => other !== item.id));
    onSetStatus(item.id, "resolved");
    setJustFixed((ids) => [...ids, item.id]);
    timers.current.set(
      item.id,
      window.setTimeout(() => settle(item.id), SETTLE_MS),
    );
    const remaining = totalHazards - resolvedCount - 1;
    setAnnouncement(p.fixedAnnounce(capitalize(item.labelEs), remaining));
  };

  const undo = (item: Item) => {
    if (Date.now() - (fixedAt.current.get(item.id) ?? 0) < DOUBLE_TAP_MS) return;
    window.clearTimeout(timers.current.get(item.id));
    timers.current.delete(item.id);
    setJustFixed((ids) => ids.filter((other) => other !== item.id));
    setReverting((ids) => [...ids, item.id]);
    onSetStatus(item.id, "pending");
    setAnnouncement(p.undoAnnounce(capitalize(item.labelEs)));
  };

  if (totalHazards === 0) {
    return <p className="text-stone-400">{p.emptyShort}</p>;
  }

  return (
    <div className="space-y-4">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="rounded-lg bg-ink-2 p-4 ring-1 ring-white/10">
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
        {resolvedCount === totalHazards && (
          <p className="mt-3 font-semibold text-emerald-300">{p.allDone}</p>
        )}
      </div>

      {roomOptions.length > 1 && (
        <div
          role="group"
          aria-label={p.filterAria}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        >
          {[{ id: null, label: p.filterAll }, ...roomOptions].map((option) => (
            <button
              key={option.id ?? "all"}
              type="button"
              aria-pressed={activeFilter === option.id}
              onClick={() => setRoomFilter(option.id)}
              className={`flex min-h-12 shrink-0 items-center rounded-full px-4 text-base font-semibold ring-1 ${activeFilter === option.id ? "bg-mint text-ink ring-mint" : "text-stone-200 ring-white/15 hover:bg-white/10"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {activeFilter !== null && shownPending.length === 0 && (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-base text-emerald-200">
          {p.roomClear}
        </p>
      )}

      {shownPending.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">{p.todo}</h2>
          <ol className="space-y-2">
            {shownPending.map((item) => {
              const fixedNow = justFixedNow.has(item.id);
              return (
                <ActionItemRow
                  key={item.id}
                  item={item}
                  // Never blocked: status changes are queued in order, so "Undo" always works.
                  busy={false}
                  justFixed={fixedNow}
                  onToggle={() => (fixedNow ? undo(item) : markFixed(item))}
                  photoHref={photoHref?.(item.roomId, item.id)}
                />
              );
            })}
          </ol>
        </section>
      )}

      {shownResolved.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">{p.done}</h2>
          <ul className="space-y-2">
            {shownResolved.map((item) => (
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
