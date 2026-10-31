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
  const raw = seg.kind === "bbox" ? [...seg.box] : seg.points;
  if (raw.length % 2 !== 0 || !raw.every(Number.isFinite)) return null;

  const scaled = raw.map((v, i) => clamp01(v / (i % 2 === 0 ? width : height)));
  const region =
    seg.kind === "bbox"
      ? { type: "bbox" as const, points: scaled }
      : { type: "polygon" as const, points: decimate(scaled) };

  const parsed = RegionSchema.safeParse(region);
  return parsed.success ? parsed.data : null;
}
