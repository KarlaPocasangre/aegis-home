import { useT } from "../lib/i18n";
import { SEVERITY_STYLES } from "../lib/labels";
import { isValidRegion, polygonPoints, regionAnchor } from "../lib/regions";
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
          const common = {
            fill: style.stroke,
            fillOpacity: active ? 0.28 : 0.12,
            stroke: style.stroke,
            strokeWidth: active ? 4 : 2.5,
            vectorEffect: "non-scaling-stroke" as const,
            opacity: hazard.status === "resolved" ? 0.35 : 1,
          };
          const [x = 0, y = 0, w = 0, h = 0] = region.points;
          return region.type === "bbox" ? (
            <rect key={hazard.id} x={x} y={y} width={w} height={h} {...common} />
          ) : (
            <polygon key={hazard.id} points={polygonPoints(region.points)} {...common} />
          );
        })}
      </svg>
      {visible.map(({ hazard, number }) => {
        const anchor = regionAnchor(hazard.region!);
        return (
          <button
            key={hazard.id}
            type="button"
            onClick={() => onSelect(hazard.id)}
            aria-label={tr.roomsView.riskAria(number, hazard.labelEs)}
            className={`absolute flex size-7 -translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full text-sm font-bold text-snow shadow ring-2 ring-snow ${SEVERITY_STYLES[hazard.severity].marker} ${hazard.id === activeId ? "scale-125" : ""}`}
            style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
}
