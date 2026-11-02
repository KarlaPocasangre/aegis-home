import {
  decodeMaskToSVGPath,
  parseImageStream,
  recordsOfKind,
  type SegmentationMaskRecord,
} from "@meta-sam/parser";

/**
 * SAM 3.1 special-token output, e.g.
 * `<0f>0<|box;x1=181;y1=365;x2=556;y2=486;w=1516;h=1600;c=0.96|><|mask;…|>,1<|box;…|><|mask;…|>`.
 * Boxes are read here; masks are decoded with Meta's `@meta-sam/parser` (see parseSamMasks).
 */
export interface SamBox {
  /** Object id that precedes the box token; its mask carries the same id. */
  id: string;
  /** Pixel corners in the space of `w`×`h`; x2/y2 are inclusive. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  h: number;
  c?: number;
}

const BOX_TOKEN = /(\d+)<\|box;([^|]*)\|>/g;

/** Fields are read by key, so the optional `c` doesn't shift anything. Malformed boxes are skipped. */
export function parseSamBoxes(text: string): SamBox[] {
  const boxes: SamBox[] = [];
  for (const match of text.matchAll(BOX_TOKEN)) {
    const fields = Object.fromEntries(
      (match[2] ?? "").split(";").map((kv) => {
        const [k, v] = kv.split("=");
        return [k, Number(v)];
      }),
    );
    const { x1, y1, x2, y2, w, h, c } = fields as Record<string, number | undefined>;
    const ints = [x1, y1, x2, y2, w, h];
    if (!ints.every((v) => v !== undefined && Number.isFinite(v))) continue;
    const box = { id: match[1], x1, y1, x2, y2, w, h } as SamBox;
    if (box.w <= 0 || box.h <= 0 || box.x2 < box.x1 || box.y2 < box.y1) continue;
    if (c !== undefined && Number.isFinite(c)) box.c = c;
    boxes.push(box);
  }
  return boxes;
}

type Rect = [x: number, y: number, width: number, height: number];

function iou(a: Rect, b: Rect): number {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = a[2] * a[3] + b[2] * b[3] - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * A concept prompt returns every instance ("rug" → all rugs). Picks the one that best overlaps
 * Spark's box for this hazard, or null when none overlaps it (a different instance: Spark's box
 * is then the better guess). Without a hint, the most confident one.
 * Returns the chosen box and its pixel rect [x, y, width, height] in the target image size.
 */
export function pickSamBox(
  boxes: SamBox[],
  size: { width: number; height: number },
  near?: Rect,
): { box: SamBox; rect: Rect } | null {
  const rects = boxes.map((b): { box: SamBox; rect: Rect; c: number } => {
    const sx = size.width / b.w;
    const sy = size.height / b.h;
    return {
      box: b,
      rect: [b.x1 * sx, b.y1 * sy, (b.x2 - b.x1 + 1) * sx, (b.y2 - b.y1 + 1) * sy],
      c: b.c ?? 0,
    };
  });
  if (rects.length === 0) return null;
  const score = (r: { rect: Rect; c: number }) => (near ? iou(r.rect, near) : 0);
  const best = rects.reduce((a, b) => {
    const diff = score(b) - score(a);
    return diff > 0 || (diff === 0 && b.c > a.c) ? b : a;
  });
  return near && score(best) === 0 ? null : { box: best.box, rect: best.rect };
}

/** Feeds a non-streaming Responses text to Meta's stream parser as one complete lane. */
async function* asEvents(text: string) {
  const lane = { item_id: "sam", output_index: 0, content_index: 0 };
  yield { type: "response.output_text.delta", ...lane, delta: text };
  yield { type: "response.output_text.done", ...lane, text };
  yield { type: "response.completed" };
}

/** Mask records by object id. Malformed records are dropped by the parser (as diagnostics). */
export async function parseSamMasks(text: string): Promise<Map<string, SegmentationMaskRecord>> {
  const masks = new Map<string, SegmentationMaskRecord>();
  if (!text) return masks;
  const result = await parseImageStream(asEvents(text)).finalResult;
  for (const record of recordsOfKind(result.records, "mask")) masks.set(record.objectId, record);
  return masks;
}

const MAX_VERTICES = 100;

type Point = [x: number, y: number];

/** Closed subpaths of an `M x y L x y … Z` path, as vertex lists. */
function subpaths(d: string): Point[][] {
  return d
    .split("M")
    .map((part) => {
      const nums = (part.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const points: Point[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) points.push([nums[i]!, nums[i + 1]!]);
      return points;
    })
    .filter((points) => points.length >= 3);
}

function area(points: Point[]): number {
  let sum = 0;
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length]!;
    sum += x1 * y2 - x2 * y1;
  });
  return Math.abs(sum) / 2;
}

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Ramer–Douglas–Peucker on an open polyline; endpoints are kept.
function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distanceToSegment(points[i]!, first, last);
    if (d > max) [index, max] = [i, d];
  }
  if (max <= epsilon) return [first, last];
  return [
    ...simplify(points.slice(0, index + 1), epsilon).slice(0, -1),
    ...simplify(points.slice(index), epsilon),
  ];
}

/** Pieces smaller than this share of the largest one are dropped (specks, reflections). */
const MIN_PIECE = 0.1;
const MAX_PIECES = 4;

/**
 * SAM mask → outlines of its main pieces as flat pixel rings [x1, y1, …] in the target image size,
 * largest first. An object split by something in front of it (a rug under a table) keeps all its
 * large pieces; holes and specks are dropped. All rings together stay within the schema's 100
 * vertices. Returns null for an empty or undecodable mask (the caller keeps the box).
 */
export function maskToPolygons(
  record: SegmentationMaskRecord,
  box: SamBox,
  size: { width: number; height: number },
): number[][] | null {
  let d: string;
  try {
    d = decodeMaskToSVGPath(record.mask);
  } catch {
    return null;
  }
  const pieces = subpaths(d)
    .map((points) => ({ points, area: area(points) }))
    .sort((a, b) => b.area - a.area);
  const largest = pieces[0]?.area ?? 0;
  if (largest === 0) return null;
  const kept = pieces.filter((p) => p.area >= largest * MIN_PIECE).slice(0, MAX_PIECES);

  // Simplify in raster pixels, coarser until every ring together fits the vertex limit.
  const rings = (epsilon: number) =>
    kept
      .map(({ points }) => simplify([...points, points[0]!], epsilon).slice(0, -1))
      .filter((ring) => ring.length >= 3);
  const total = (rs: Point[][]) => rs.reduce((n, r) => n + r.length, 0);
  let epsilon = 0.5;
  let simplified = rings(epsilon);
  while (total(simplified) > MAX_VERTICES && epsilon < 64) simplified = rings((epsilon *= 2));
  if (simplified.length === 0) return null;

  // Raster pixel i spans [i - 0.5, i + 0.5] in path units and covers the record's bounds.
  const { bounds, mask } = record;
  const rx = (bounds.right - bounds.left) / mask.width;
  const ry = (bounds.bottom - bounds.top) / mask.height;
  const sx = size.width / box.w;
  const sy = size.height / box.h;
  return simplified.map((ring) =>
    ring.flatMap(([x, y]) => [
      (bounds.left + (x + 0.5) * rx) * sx,
      (bounds.top + (y + 0.5) * ry) * sy,
    ]),
  );
}
