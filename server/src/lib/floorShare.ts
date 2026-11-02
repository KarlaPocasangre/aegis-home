import type { Region } from "../schemas/ai.js";

// Share of the visible floor a hazard covers (docs/AI_INTEGRATION.md §6.1). Regions are rasterized
// on a grid in normalized space: a ratio of areas is unchanged by the non-uniform scaling to 0–1.

const GRID = 160;
/** Below this much visible floor (fraction of the image) the share is not meaningful. */
const MIN_FLOOR = 0.02;

function vertices(region: Region): number[] {
  if (region.type === "polygon") return region.points;
  const [x = 0, y = 0, w = 0, h = 0] = region.points;
  return [x, y, x + w, y, x + w, y + h, x, y + h];
}

/** Marks the cells whose centers fall inside the region (even-odd scanline fill). */
function fill(cells: Uint8Array, region: Region) {
  const pts = vertices(region);
  const n = pts.length / 2;
  for (let row = 0; row < GRID; row++) {
    const y = (row + 0.5) / GRID;
    const xs: number[] = [];
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi, xj, yj] = [pts[2 * i]!, pts[2 * i + 1]!, pts[2 * j]!, pts[2 * j + 1]!];
      if (yi > y !== yj > y) xs.push(xi + ((y - yi) / (yj - yi)) * (xj - xi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.max(0, Math.ceil(xs[k]! * GRID - 0.5));
      const to = Math.min(GRID - 1, Math.floor(xs[k + 1]! * GRID - 0.5));
      for (let col = from; col <= to; col++) cells[row * GRID + col] = 1;
    }
  }
}

export function rasterizeFloor(floor: Region[]): Uint8Array {
  const cells = new Uint8Array(GRID * GRID);
  for (const region of floor) fill(cells, region);
  return cells;
}

/**
 * area(hazard) / area(walkway ∪ hazard), rounded to whole percent. `walkway` should already include
 * the floor-level hazards (SAM's "floor" usually excludes a rug lying on it); the union with the
 * hazard itself keeps the result ≤ 1 either way. Null when too little floor is in view.
 */
export function floorShare(hazard: Region, floor: Uint8Array): number | null {
  const cells = new Uint8Array(GRID * GRID);
  fill(cells, hazard);
  let covered = 0;
  let union = 0;
  let floorOnly = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) covered++;
    if (cells[i] || floor[i]) union++;
    if (floor[i] && !cells[i]) floorOnly++;
  }
  if (covered === 0 || floorOnly / cells.length < MIN_FLOOR) return null;
  return Math.round((covered / union) * 100) / 100;
}
