import { EmptyState } from "../../components/EmptyState";
import { RoomCard } from "../../components/RoomCard";
import { ViewTitle } from "../../components/ViewTitle";
import { useT } from "../../lib/i18n";
import { roomLabel } from "../../lib/labels";
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
