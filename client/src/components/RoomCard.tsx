import { useState } from "react";
import { linkHandler } from "../lib/router";
import { ROOM_LABELS } from "../lib/labels";
import { useRoomImage } from "../lib/roomImages";
import type { Room } from "../lib/types";
import { FallbackBanner } from "./FallbackBanner";
import { HazardCard } from "./HazardCard";
import { ImageCanvasOverlay } from "./ImageCanvasOverlay";

interface Props {
  room: Room;
  /** Hazard highlighted on open (from "Ver en la foto" in the plan). */
  initialActiveId?: string;
  /** False when the page title already names the room. */
  showTitle?: boolean;
  /** Makes the title a link to the room's own page. */
  href?: string;
}

export function RoomCard({ room, initialActiveId, showTitle = true, href }: Props) {
  const image = useRoomImage(room.id);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId ?? null);
  const select = (id: string) => setActiveId((current) => (current === id ? null : id));
  const label = ROOM_LABELS[room.type];

  return (
    <article className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
      {showTitle && (
        <h2 className="mb-3 text-xl font-bold">
          {href ? (
            <a
              href={href}
              onClick={linkHandler(href)}
              className="text-teal-900 underline-offset-4 hover:underline"
            >
              {label}
            </a>
          ) : (
            label
          )}
        </h2>
      )}
      <div className="space-y-3">
        <FallbackBanner source={room.source} notice={room.notice} />
        {image ? (
          <ImageCanvasOverlay
            src={image}
            alt={`Foto de ${label.toLowerCase()}`}
            hazards={room.hazards}
            activeId={activeId}
            onSelect={select}
          />
        ) : (
          <p className="rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-600">
            Las fotos no se guardan. Para ver los riesgos resaltados, vuelva a subir la foto de este
            espacio.
          </p>
        )}
        {room.hazards.length === 0 ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            No se encontraron riesgos visibles en esta foto.
          </p>
        ) : (
          <ol className="space-y-2">
            {room.hazards.map((hazard, index) => (
              <HazardCard
                key={hazard.id}
                hazard={hazard}
                number={index + 1}
                active={hazard.id === activeId}
                onSelect={select}
              />
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
