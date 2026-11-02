import { RegionSchema, type Region } from "../schemas/ai.js";
import type { RawSegmentation } from "./metaClient.js";

const MAX_POLYGON_VALUES = 200;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Keeps every k-th vertex so the polygon fits the schema limit.
function decimate(points: number[]): number[] {
  const vertices = points.length / 2;
  const maxVertices = MAX_POLYGON_VALUES / 2;
  if (vertices <= maxVertices) return points;
  const step = Math.ceil(vertices / maxVertices);
  const out: number[] = [];
  for (let v = 0; v < vertices; v += step)
    out.push(points[2 * v] as number, points[2 * v + 1] as number);
  return out;
}

/** Pixel-space segmentation → normalized 0–1 region, re-validated. Invalid input → null. */
export function toNormalizedRegion(
  seg: RawSegmentation,
  size: { width: number; height: number },
): Region | null {
  const { width, height } = size;
  const scale = (raw: number[]) =>
    raw.length % 2 === 0 && raw.every(Number.isFinite)
      ? raw.map((v, i) => clamp01(v / (i % 2 === 0 ? width : height)))
      : null;
  let region: unknown;
  if (seg.kind === "multipolygon") {
    const rings = seg.rings.map(scale);
    if (rings.some((r) => r === null)) return null;
    region = { type: "multipolygon", points: rings };
  } else {
    const scaled = scale(seg.kind === "bbox" ? [...seg.box] : seg.points);
    if (!scaled) return null;
    region =
      seg.kind === "bbox"
        ? { type: "bbox", points: scaled }
        : { type: "polygon", points: decimate(scaled) };
  }

  const parsed = RegionSchema.safeParse(region);
  return parsed.success ? parsed.data : null;
}

const GRID = 1000;

/**
 * Spark grounding box ([x_min, y_min, x_max, y_max] on a 0–1000 grid) → pixel bbox of the
 * normalized image. Empty or inverted boxes → null.
 */
export function sparkBoxToSegmentation(
  box: number[] | undefined,
  size: { width: number; height: number },
): RawSegmentation | null {
  if (!box || box.length !== 4 || !box.every(Number.isFinite)) return null;
  const [x0, y0, x1, y1] = box.map((v) => Math.min(GRID, Math.max(0, v))) as [
    number,
    number,
    number,
    number,
  ];
  if (x1 <= x0 || y1 <= y0) return null;
  const sx = size.width / GRID;
  const sy = size.height / GRID;
  return { kind: "bbox", box: [x0 * sx, y0 * sy, (x1 - x0) * sx, (y1 - y0) * sy] };
}
