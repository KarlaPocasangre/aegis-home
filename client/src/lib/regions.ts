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

export interface Point {
  x: number;
  y: number;
}

/**
 * Where the numbered marker goes, as fractions: a box's top-left corner, or a polygon's
 * topmost vertex (its bounding corner can sit far outside an irregular outline).
 */
export function regionAnchor(region: Region): Point {
  if (region.type === "bbox") return { x: region.points[0] ?? 0, y: region.points[1] ?? 0 };
  let best: Point = { x: region.points[0] ?? 0, y: region.points[1] ?? 0 };
  for (let i = 2; i + 1 < region.points.length; i += 2) {
    const p = { x: region.points[i] ?? 0, y: region.points[i + 1] ?? 0 };
    if (p.y < best.y || (p.y === best.y && p.x < best.x)) best = p;
  }
  return best;
}

// Roughly one marker's size on a phone-width photo, as fractions of the image.
const GAP_X = 0.07;
const GAP_Y = 0.09;
const EDGE = 0.03;

const clampUnit = (v: number) => Math.min(1 - EDGE, Math.max(EDGE, v));

/**
 * Keeps markers inside the photo and apart from each other: each one that would cover an
 * earlier one slides right (or down near the right edge) until it is clear.
 */
export function placeMarkers(anchors: Point[]): Point[] {
  const placed: Point[] = [];
  for (const anchor of anchors) {
    let p = { x: clampUnit(anchor.x), y: clampUnit(anchor.y) };
    for (let tries = 0; tries < 20; tries++) {
      const hit = placed.some((q) => Math.abs(q.x - p.x) < GAP_X && Math.abs(q.y - p.y) < GAP_Y);
      if (!hit) break;
      p =
        p.x + GAP_X <= 1 - EDGE
          ? { x: p.x + GAP_X, y: p.y }
          : { x: clampUnit(anchor.x), y: clampUnit(p.y + GAP_Y) };
    }
    placed.push(p);
  }
  return placed;
}

export function polygonPoints(points: number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) pairs.push(`${points[i]},${points[i + 1]}`);
  return pairs.join(" ");
}
