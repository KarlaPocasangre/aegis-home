import { useState } from "react";
import { linkHandler } from "../lib/router";
import { useT } from "../lib/i18n";
import { roomLabel } from "../lib/labels";
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
  const tr = useT();
  const label = roomLabel(room.type);

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      {showTitle && (
        <h2 className="mb-3 text-xl font-bold">
          {href ? (
            <a
              href={href}
              onClick={linkHandler(href)}
              className="text-mint underline-offset-4 hover:underline"
            >
              {label}
            </a>
          ) : (
            label
          )}
        </h2>
      )}
      <div className="space-y-3">
        <FallbackBanner source={room.source} />
        {image ? (
          <ImageCanvasOverlay
            src={image}
            alt={tr.roomsView.photoAlt(label)}
            hazards={room.hazards}
            activeId={activeId}
            onSelect={select}
          />
        ) : (
          <p className="rounded-lg bg-white/5 px-4 py-3 text-sm text-stone-400">
            {tr.roomsView.noPhoto}
          </p>
        )}
        {room.hazards.length === 0 ? (
          <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {tr.roomsView.noHazards}
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
