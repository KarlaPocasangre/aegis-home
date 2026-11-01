/**
 * SAM 3.1 special-token output, e.g.
 * `<0f>0<|box;x1=181;y1=365;x2=556;y2=486;w=1516;h=1600;c=0.96|><|mask;…|>,1<|box;…|><|mask;…|>`.
 * Only boxes are read: masks are base85 rasters we don't need for a highlight.
 */
export interface SamBox {
  /** Pixel corners in the space of `w`×`h`; x2/y2 are inclusive. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  h: number;
  c?: number;
}

const BOX_TOKEN = /<\|box;([^|]*)\|>/g;

/** Fields are read by key, so the optional `c` doesn't shift anything. Malformed boxes are skipped. */
export function parseSamBoxes(text: string): SamBox[] {
  const boxes: SamBox[] = [];
  for (const match of text.matchAll(BOX_TOKEN)) {
    const fields = Object.fromEntries(
      (match[1] ?? "").split(";").map((kv) => {
        const [k, v] = kv.split("=");
        return [k, Number(v)];
      }),
    );
    const { x1, y1, x2, y2, w, h, c } = fields as Record<string, number | undefined>;
    const ints = [x1, y1, x2, y2, w, h];
    if (!ints.every((v) => v !== undefined && Number.isFinite(v))) continue;
    const box = { x1, y1, x2, y2, w, h } as SamBox;
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
 * Returns a pixel rect [x, y, width, height] in the target image size.
 */
export function pickSamBox(
  boxes: SamBox[],
  size: { width: number; height: number },
  near?: Rect,
): Rect | null {
  const rects = boxes.map((b): { rect: Rect; c: number } => {
    const sx = size.width / b.w;
    const sy = size.height / b.h;
    return {
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
  return near && score(best) === 0 ? null : best.rect;
}
