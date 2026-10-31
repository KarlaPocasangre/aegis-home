import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { loadFixtures } from "../src/lib/fixtures.js";
import { normalizeImage } from "../src/lib/imagePipeline.js";
import { toNormalizedRegion } from "../src/lib/regions.js";
import { ROOM_TYPES } from "../src/schemas/enums.js";
import { buildPlan } from "../src/services/planService.js";
import { jpeg } from "./helpers.js";

describe("normalizeImage", () => {
  it("resizes to 1024 px on the longest side and strips metadata", async () => {
    const input = await sharp(await jpeg(2000, 1000))
      .withExif({ IFD0: { Copyright: "private" } })
      .toBuffer();
    const out = await normalizeImage(input);
    expect([out.width, out.height]).toEqual([1024, 512]);
    expect(out.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect((await sharp(out.buffer).metadata()).exif).toBeUndefined();
  });

  it("does not enlarge small images", async () => {
    const out = await normalizeImage(await jpeg(400, 300));
    expect([out.width, out.height]).toEqual([400, 300]);
  });

  it("rejects non-images by magic bytes", async () => {
    await expect(normalizeImage(Buffer.from("GIF89a fake"))).rejects.toMatchObject({ status: 415 });
    await expect(normalizeImage(Buffer.from("%PDF-1.7"))).rejects.toMatchObject({ status: 415 });
  });

  it("rejects truncated images", async () => {
    const truncated = (await jpeg()).subarray(0, 200);
    await expect(normalizeImage(truncated)).rejects.toMatchObject({ status: 415 });
  });
});

describe("toNormalizedRegion", () => {
  const size = { width: 1000, height: 500 };

  it("normalizes and clamps polygons", () => {
    expect(
      toNormalizedRegion({ kind: "polygon", points: [0, 0, 1100, 250, 500, 500] }, size),
    ).toEqual({
      type: "polygon",
      points: [0, 0, 1, 0.5, 0.5, 1],
    });
  });

  it("decimates polygons over 100 vertices", () => {
    const points = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? i : 250));
    const region = toNormalizedRegion({ kind: "polygon", points }, size);
    expect(region?.points.length).toBeLessThanOrEqual(200);
  });

  it("rejects non-finite or malformed input", () => {
    expect(toNormalizedRegion({ kind: "bbox", box: [0, Number.NaN, 10, 10] }, size)).toBeNull();
    expect(toNormalizedRegion({ kind: "polygon", points: [1, 2, 3] }, size)).toBeNull();
  });
});

describe("buildPlan", () => {
  it("orders pending hazards by severity then confidence and totals pending cost", () => {
    const plan = buildPlan([
      { id: "a", severity: "low", confidence: 0.9, status: "pending", costEstimateUsd: 1.1 },
      { id: "b", severity: "high", confidence: 0.5, status: "pending", costEstimateUsd: 10 },
      { id: "c", severity: "high", confidence: 0.9, status: "pending", costEstimateUsd: 20.2 },
      { id: "d", severity: "medium", confidence: 0.9, status: "resolved", costEstimateUsd: 99 },
    ]);
    expect(plan).toEqual({
      totalHazards: 4,
      resolved: 1,
      pendingCostUsd: 31.3,
      orderedHazardIds: ["c", "b", "a"],
    });
  });
});

describe("generic fixtures", () => {
  it("exist and validate for every room type, without regions", () => {
    const store = loadFixtures(fileURLToPath(new URL("../fixtures", import.meta.url)));
    for (const room of ROOM_TYPES) {
      const fixture = store.generic(room);
      expect(fixture?.roomType).toBe(room);
      expect(fixture?.hazards.every((h) => h.region === null)).toBe(true);
    }
  });
});
