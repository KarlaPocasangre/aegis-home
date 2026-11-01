import { useId, useState } from "react";
import { linkHandler } from "../lib/router";
import { revealElement } from "../lib/scrollTo";
import { useLang, useT } from "../lib/i18n";
import { roomLabel } from "../lib/labels";
import { roomImages, useRoomImage } from "../lib/roomImages";
import type { Room } from "../lib/types";
import { FallbackBanner } from "./FallbackBanner";
import { HazardCard, hazardElementId } from "./HazardCard";
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

/**
 * After a reload the photo is gone (it is never stored). Choosing the same photo shows the
 * markers again on this device only: nothing is uploaded or re-analyzed, so no duplicate room.
 */
function RestorePhoto({ roomId }: { roomId: string }) {
  const r = useT().roomsView;
  const inputId = useId();
  return (
    <div className="rounded-lg bg-white/5 px-4 py-3">
      <p className="text-base text-stone-300">{r.noPhoto}</p>
      <label
        htmlFor={inputId}
        className="mt-3 inline-flex min-h-12 cursor-pointer items-center rounded-lg bg-white/10 px-4 text-base font-semibold text-white hover:bg-white/20 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint"
      >
        {r.restorePhoto}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) roomImages.set(roomId, URL.createObjectURL(file));
          }}
          className="sr-only"
        />
      </label>
    </div>
  );
}

export function RoomCard({ room, initialActiveId, showTitle = true, href }: Props) {
  const image = useRoomImage(room.id);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId ?? null);
  const select = (id: string) => setActiveId((current) => (current === id ? null : id));
  // On phones the list sits below the photo: a marker tap brings its card into view.
  const selectFromPhoto = (id: string) => {
    select(id);
    if (activeId !== id) revealElement(document.getElementById(hazardElementId(id)));
  };
  const tr = useT();
  const appLang = useLang();
  const label = roomLabel(room.type);

  return (
    <article className="rounded-xl border border-white/10 bg-ink-2 p-4 sm:p-5">
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
        {room.language !== appLang && (
          <p className="rounded-lg bg-white/5 px-4 py-3 text-sm text-stone-300">
            {tr.roomsView.otherLanguage(tr.roomsView.languageNames[room.language] ?? room.language)}
          </p>
        )}
        {image ? (
          <ImageCanvasOverlay
            src={image}
            alt={tr.roomsView.photoAlt(label)}
            hazards={room.hazards}
            activeId={activeId}
            onSelect={selectFromPhoto}
          />
        ) : (
          <RestorePhoto roomId={room.id} />
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
                lang={room.language}
              />
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
