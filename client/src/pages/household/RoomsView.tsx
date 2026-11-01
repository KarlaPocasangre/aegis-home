import { EmptyState } from "../../components/EmptyState";
import { RoomCard } from "../../components/RoomCard";
import { ViewTitle } from "../../components/ViewTitle";
import { ROOM_LABELS } from "../../lib/labels";
import { householdPath, linkHandler, roomPath } from "../../lib/router";
import type { Room } from "../../lib/types";

interface Props {
  token: string;
  rooms: Room[];
  roomId?: string;
  hazardId?: string;
}

function BackLink({ token }: { token: string }) {
  const path = householdPath(token, "espacios");
  return (
    <a
      href={path}
      onClick={linkHandler(path)}
      className="inline-flex min-h-12 items-center gap-1 text-base font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-900"
    >
      <span aria-hidden>←</span> Todos los espacios
    </a>
  );
}

export function RoomsView({ token, rooms, roomId, hazardId }: Props) {
  if (roomId) {
    const room = rooms.find((r) => r.id === roomId);
    return (
      <div className="space-y-4">
        <BackLink token={token} />
        {room ? (
          <>
            <ViewTitle>{ROOM_LABELS[room.type]}</ViewTitle>
            <RoomCard room={room} initialActiveId={hazardId} showTitle={false} />
          </>
        ) : (
          <ViewTitle subtitle="Puede que se haya borrado.">No encontramos este espacio</ViewTitle>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewTitle subtitle="Toque un número en la foto o un riesgo de la lista para resaltarlo.">
        Espacios analizados
      </ViewTitle>
      {rooms.length === 0 ? (
        <EmptyState token={token} text="Todavía no ha analizado ningún espacio." />
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
