import type { Region } from "./types";

const inUnit = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;

/** Coordinates are checked before they reach SVG attributes (docs/API_SPECS.md §3). */
export function isValidRegion(region: Region | null | undefined): region is Region {
  if (!region || !Array.isArray(region.points) || !region.points.every(inUnit)) return false;
  if (region.type === "bbox") return region.points.length === 4;
  if (region.type === "polygon") {
    return region.points.length >= 6 && region.points.length % 2 === 0;
  }
  return false;
}

/** Top-left corner of a region, as fractions — where the numbered marker goes. */
export function regionAnchor(region: Region): { x: number; y: number } {
  if (region.type === "bbox") return { x: region.points[0] ?? 0, y: region.points[1] ?? 0 };
  const xs = region.points.filter((_, i) => i % 2 === 0);
  const ys = region.points.filter((_, i) => i % 2 === 1);
  return { x: Math.min(...xs), y: Math.min(...ys) };
}

export function polygonPoints(points: number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) pairs.push(`${points[i]},${points[i + 1]}`);
  return pairs.join(" ");
}
