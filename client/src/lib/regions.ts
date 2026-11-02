import type { Region } from "./types";

const inUnit = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;

/** Coordinates are checked before they reach SVG attributes (docs/API_SPECS.md §3). */
const isRing = (points: unknown): points is number[] =>
  Array.isArray(points) && points.length >= 6 && points.length % 2 === 0 && points.every(inUnit);

export function isValidRegion(region: Region | null | undefined): region is Region {
  if (!region || !Array.isArray(region.points)) return false;
  if (region.type === "multipolygon") {
    return region.points.length >= 2 && region.points.length <= 4 && region.points.every(isRing);
  }
  if (region.type === "bbox") return region.points.length === 4 && region.points.every(inUnit);
  if (region.type === "polygon") return isRing(region.points);
  return false;
}

export interface Point {
  x: number;
  y: number;
}

function vertices(points: number[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) out.push({ x: points[i]!, y: points[i + 1]! });
  return out;
}

/** Area centroid of a simple polygon; null when it has no area. */
function centroid(poly: Point[]): Point | null {
  let a = 0;
  let cx = 0;
  let cy = 0;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    const cross = p.x * q.y - q.x * p.y;
    a += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  });
  return a === 0 ? null : { x: cx / (3 * a), y: cy / (3 * a) };
}

function inside(poly: Point[], { x, y }: Point): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i]!, poly[j]!];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

/**
 * Where the numbered marker goes, as fractions: a box's top-left corner; for an outline, its
 * center when that falls on the object (a wide rug's top edge can end next to another hazard),
 * else its topmost vertex (the center of a C-shaped outline is off the object).
 */
export function regionAnchor(region: Region): Point {
  if (region.type === "bbox") return { x: region.points[0] ?? 0, y: region.points[1] ?? 0 };
  // Pieces arrive largest first; the marker goes on the main one.
  const poly = vertices(region.type === "multipolygon" ? (region.points[0] ?? []) : region.points);
  const center = centroid(poly);
  if (center && inside(poly, center)) return center;
  let best: Point = poly[0] ?? { x: 0, y: 0 };
  for (const p of poly) if (p.y < best.y || (p.y === best.y && p.x < best.x)) best = p;
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

/** SVG path data for several rings: each piece is drawn and filled on its own. */
export function ringsPath(rings: number[][]): string {
  return rings.map((ring) => `M${polygonPoints(ring).replaceAll(" ", "L")}Z`).join(" ");
}

export function polygonPoints(points: number[]): string {
  const pairs: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) pairs.push(`${points[i]},${points[i + 1]}`);
  return pairs.join(" ");
}
