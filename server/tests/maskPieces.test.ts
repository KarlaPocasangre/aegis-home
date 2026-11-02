import { describe, expect, it, vi } from "vitest";

// Two large pieces and a speck, as decodeMaskToSVGPath would trace a rug split by a table leg.
vi.mock("@meta-sam/parser", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@meta-sam/parser")>()),
  decodeMaskToSVGPath: () =>
    "M0 0L40 0L40 20L0 20Z M60 0L100 0L100 20L60 20Z M50 30L51 30L51 31L50 31Z",
}));

const { maskToPolygons } = await import("../src/lib/samOutput.js");
const { toNormalizedRegion } = await import("../src/lib/regions.js");

const record = {
  mask: { encoding: "one_bit", payload: "", width: 100, height: 40 },
  bounds: { left: 0, top: 0, right: 100, bottom: 40 },
} as never;
const box = { id: "0", x1: 0, y1: 0, x2: 99, y2: 39, w: 100, h: 40 };

describe("multi-piece masks", () => {
  it("keeps every large piece of an object and drops specks", () => {
    const rings = maskToPolygons(record, box, { width: 100, height: 40 })!;
    expect(rings).toHaveLength(2);
    expect(rings.every((r) => r.length >= 6)).toBe(true);
  });

  it("normalizes the pieces into one multipolygon region", () => {
    const rings = maskToPolygons(record, box, { width: 100, height: 40 })!;
    const region = toNormalizedRegion({ kind: "multipolygon", rings }, { width: 100, height: 40 });
    expect(region?.type).toBe("multipolygon");
    expect((region?.points as number[][]).flat().every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
