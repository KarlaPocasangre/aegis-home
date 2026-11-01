import { EmptyState } from "../../components/EmptyState";
import { RoomCard } from "../../components/RoomCard";
import { ViewTitle } from "../../components/ViewTitle";
import { useT } from "../../lib/i18n";
import { formatUsd, roomLabel } from "../../lib/labels";
import { householdPath, linkHandler, roomPath } from "../../lib/router";
import type { Room } from "../../lib/types";

interface Props {
  token: string;
  rooms: Room[];
  roomId?: string;
  hazardId?: string;
}

function BackLink({ token }: { token: string }) {
  const back = useT().roomsView.back;
  const path = householdPath(token, "espacios");
  return (
    <a
      href={path}
      onClick={linkHandler(path)}
      className="inline-flex min-h-12 items-center gap-1 text-base font-semibold text-mint underline underline-offset-4 hover:text-mint"
    >
      <span aria-hidden>←</span> {back}
    </a>
  );
}

/** What the analysis found and the next step, so a finished analysis never ends in "and now?". */
function RoomSummary({ token, room }: { token: string; room: Room }) {
  const r = useT().roomsView;
  const pending = room.hazards.filter((h) => h.status === "pending");
  if (room.hazards.length === 0) return null;
  const high = pending.filter((h) => h.severity === "high").length;
  const cost = pending.reduce((sum, h) => sum + h.costEstimateUsd, 0);
  const planPath = householdPath(token);
  const analyzePath = householdPath(token, "analizar");
  return (
    <section
      aria-labelledby="room-summary"
      className="rounded-xl bg-mint/10 p-4 ring-1 ring-mint/30 sm:p-5"
    >
      <h2 id="room-summary" className="text-lg font-bold text-white">
        {r.summaryTitle(roomLabel(room.type), room.hazards.length)}
      </h2>
      <p className="mt-1 text-base text-stone-300">
        {pending.length === 0 ? (
          r.summaryResolved
        ) : (
          <>
            {high > 0 && `${r.summaryHigh(high)} `}
            {r.summaryCost(formatUsd(cost))}
          </>
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={planPath}
          onClick={linkHandler(planPath)}
          className="inline-flex min-h-12 items-center rounded-lg bg-mint px-5 text-base font-semibold text-ink hover:bg-mint-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
        >
          {r.seePlan}
        </a>
        <a
          href={analyzePath}
          onClick={linkHandler(analyzePath)}
          className="inline-flex min-h-12 items-center rounded-lg bg-white/10 px-5 text-base font-semibold text-white hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
        >
          {r.analyzeAnother}
        </a>
      </div>
    </section>
  );
}

export function RoomsView({ token, rooms, roomId, hazardId }: Props) {
  const r = useT().roomsView;
  if (roomId) {
    const room = rooms.find((r) => r.id === roomId);
    return (
      <div className="space-y-4">
        <BackLink token={token} />
        {room ? (
          <>
            <ViewTitle>{roomLabel(room.type)}</ViewTitle>
            <RoomSummary token={token} room={room} />
            <RoomCard room={room} initialActiveId={hazardId} showTitle={false} />
          </>
        ) : (
          <ViewTitle subtitle={r.notFoundHint}>{r.notFound}</ViewTitle>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewTitle subtitle={r.subtitle}>{r.title}</ViewTitle>
      {rooms.length === 0 ? (
        <EmptyState token={token} text={r.empty} />
      ) : (
        <div className="space-y-4">
          {[...rooms].reverse().map((room) => (
            <RoomCard key={room.id} room={room} href={roomPath(token, room.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
