import { describe, expect, it, vi } from "vitest";
import { createFixtureStore } from "../src/lib/fixtures.js";
import { floorShare, rasterizeFloor } from "../src/lib/floorShare.js";
import type { MetaClient } from "../src/lib/metaClient.js";
import { createVisionService } from "../src/services/visionService.js";
import { fakeImage, sparkHazard } from "./helpers.js";

const square = (x: number, y: number, s: number) => ({
  type: "polygon" as const,
  points: [x, y, x + s, y, x + s, y + s, x, y + s],
});

describe("floorShare", () => {
  it("divides the hazard's area by the floor plus the hazard", () => {
    const floor = rasterizeFloor([{ type: "bbox", points: [0, 0.5, 1, 0.5] }]);
    // Inside the floor: 0.04 / 0.5.
    expect(floorShare(square(0.2, 0.6, 0.2), floor)).toBeCloseTo(0.08, 2);
    // A rug SAM left out of the floor is added back: 0.04 / (0.5 + 0.04).
    expect(floorShare(square(0.2, 0.2, 0.2), floor)).toBeCloseTo(0.07, 2);
  });

  it("counts every piece of a multi-piece outline", () => {
    const floor = rasterizeFloor([{ type: "bbox", points: [0, 0.5, 1, 0.5] }]);
    const pieces = {
      type: "multipolygon" as const,
      points: [square(0.1, 0.6, 0.2).points, square(0.6, 0.6, 0.2).points],
    };
    expect(floorShare(pieces, floor)).toBeCloseTo(0.16, 2);
  });

  it("returns null without enough visible floor or without an area", () => {
    const tiny = rasterizeFloor([{ type: "bbox", points: [0, 0.9, 0.1, 0.1] }]);
    expect(floorShare(square(0.5, 0.5, 0.2), tiny)).toBeNull();
    const floor = rasterizeFloor([{ type: "bbox", points: [0, 0.5, 1, 0.5] }]);
    expect(
      floorShare({ type: "polygon", points: [0.1, 0.6, 0.1, 0.6, 0.1, 0.6] }, floor),
    ).toBeNull();
  });
});

describe("visionService floor share", () => {
  const image = fakeImage(); // 1000 × 500
  const polygon = { kind: "polygon" as const, points: [200, 300, 400, 300, 400, 400, 200, 400] };

  function vision(overrides: Partial<MetaClient>) {
    const usage = { tryConsume: vi.fn(async (_calls: number) => true) };
    const service = createVisionService({
      client: {
        detectHazards: async () => ({
          room_type: "living_room",
          hazards: [
            sparkHazard({ on_floor: true }),
            sparkHazard({ id: "h2", label_en: "lamp", on_floor: false }),
          ],
        }),
        segment: async () => polygon,
        ...overrides,
      },
      fixtures: createFixtureStore({}),
      usage,
    });
    return { service, usage };
  }

  it("measures floor hazards with one extra SAM call for the floor", async () => {
    const segmentAll = vi.fn(async (_img: unknown, _label: string, _signal: unknown) => [
      { kind: "bbox" as const, box: [0, 250, 1000, 250] as [number, number, number, number] },
    ]);
    const { service, usage } = vision({ segmentAll });
    const result = await service.analyze(image, "living_room", "es");

    expect(segmentAll).toHaveBeenCalledTimes(1);
    expect(segmentAll.mock.calls[0]?.[1]).toBe("floor");
    // 0.2 × 0.2 of the image over a floor of 0.5, inside the floor.
    expect(result.hazards[0]?.floor_share).toBeCloseTo(0.08, 2);
    expect(result.hazards[1]?.floor_share).toBeNull();
    // Spark, SAM per hazard, then the floor.
    expect(usage.tryConsume.mock.calls.map((c) => c[0])).toEqual([1, 2, 1]);
  });

  it("counts a rug SAM left out of the floor as walkway for the other hazards", async () => {
    // Image 1000 × 500. Floor: a strip, 10 %. Rug: 40 %, outside it. Pouf: 2 %, on the rug.
    const rect = (x: number, y: number, w: number, h: number) => ({
      kind: "polygon" as const,
      points: [x, y, x + w, y, x + w, y + h, x, y + h],
    });
    const { service } = vision({
      detectHazards: async () => ({
        room_type: "living_room",
        hazards: [
          sparkHazard({ label_en: "rug", on_floor: true }),
          sparkHazard({ id: "h2", label_en: "pouf", on_floor: true }),
        ],
      }),
      segment: async (_img, label) =>
        label === "rug" ? rect(0, 250, 1000, 200) : rect(800, 350, 100, 100),
      segmentAll: async () => [rect(0, 450, 1000, 50)],
    });
    const [rug, pouf] = (await service.analyze(image, "living_room", "es")).hazards;

    // Walkway = strip + rug = 50 %. Without the rug, the pouf would read 0.02 / 0.12 ≈ 17 %.
    expect(rug?.floor_share).toBeCloseTo(0.8, 2);
    expect(pouf?.floor_share).toBeCloseTo(0.04, 2);
  });

  it("skips the floor call when no hazard is on the floor", async () => {
    const segmentAll = vi.fn(async () => []);
    const { service } = vision({
      segmentAll,
      detectHazards: async () => ({
        room_type: "living_room",
        hazards: [sparkHazard({ on_floor: false })],
      }),
    });
    const result = await service.analyze(image, "living_room", "es");
    expect(segmentAll).not.toHaveBeenCalled();
    expect(result.hazards[0]?.floor_share).toBeNull();
  });

  it("keeps the live result when the floor call fails", async () => {
    const { service } = vision({
      segmentAll: async () => {
        throw new Error("boom");
      },
    });
    const result = await service.analyze(image, "living_room", "es");
    expect(result.source).toBe("live");
    expect(result.hazards[0]?.region?.type).toBe("polygon");
    expect(result.hazards[0]?.floor_share).toBeNull();
  });
});
