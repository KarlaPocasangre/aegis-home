import { useT } from "../lib/i18n";
import { SEVERITY_STYLES } from "../lib/labels";
import { isValidRegion, placeMarkers, polygonPoints, regionAnchor } from "../lib/regions";
import type { Hazard } from "../lib/types";

interface Props {
  src: string;
  alt: string;
  hazards: Hazard[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

// Regions are normalized 0–1, so a 1×1 viewBox stretched over the image lines them up at any size.
export function ImageCanvasOverlay({ src, alt, hazards, activeId, onSelect }: Props) {
  const tr = useT();
  const visible = hazards
    .map((hazard, index) => ({ hazard, number: index + 1 }))
    .filter(({ hazard }) => isValidRegion(hazard.region));
  const markers = placeMarkers(visible.map(({ hazard }) => regionAnchor(hazard.region!)));

  return (
    <div className="relative overflow-hidden rounded-lg bg-stone-200 dark:bg-white/5">
      <img src={src} alt={alt} className="block h-auto w-full" />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden
      >
        {visible.map(({ hazard }) => {
          const region = hazard.region!;
          const style = SEVERITY_STYLES[hazard.severity];
          const active = hazard.id === activeId;
          // With one hazard selected the others step back, so the photo is not a tangle of boxes.
          const dimmed = hazard.status === "resolved" || (activeId !== null && !active);
          const common = {
            fill: style.stroke,
            fillOpacity: active ? 0.28 : 0.12,
            stroke: style.stroke,
            strokeWidth: active ? 4 : 2.5,
            vectorEffect: "non-scaling-stroke" as const,
            opacity: dimmed ? 0.35 : 1,
          };
          const [x = 0, y = 0, w = 0, h = 0] = region.points;
          return region.type === "bbox" ? (
            <rect key={hazard.id} x={x} y={y} width={w} height={h} {...common} />
          ) : (
            <polygon key={hazard.id} points={polygonPoints(region.points)} {...common} />
          );
        })}
      </svg>
      {visible.map(({ hazard, number }, index) => {
        const anchor = markers[index]!;
        const active = hazard.id === activeId;
        // A 44px invisible hit area around a 32px badge: big enough for a shaky finger.
        return (
          <button
            key={hazard.id}
            type="button"
            onClick={() => onSelect(hazard.id)}
            aria-label={tr.roomsView.riskAria(number, hazard.labelEs)}
            aria-pressed={active}
            className={`group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-mint ${active ? "z-10" : ""}`}
            // clamp() keeps the 44px hit area inside the photo at any width.
            style={{
              left: `clamp(22px, ${anchor.x * 100}%, calc(100% - 22px))`,
              top: `clamp(22px, ${anchor.y * 100}%, calc(100% - 22px))`,
            }}
          >
            <span
              aria-hidden
              className={`flex size-8 items-center justify-center rounded-full text-sm font-bold text-snow shadow ring-2 ring-snow transition-transform ${SEVERITY_STYLES[hazard.severity].marker} ${active ? "scale-125" : ""}`}
            >
              {number}
            </span>
          </button>
        );
      })}
    </div>
  );
}
