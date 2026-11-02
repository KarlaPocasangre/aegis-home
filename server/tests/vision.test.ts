import { describe, expect, it, vi } from "vitest";
import { createFixtureStore, type Fixture } from "../src/lib/fixtures.js";
import { ProviderError, type MetaClient } from "../src/lib/metaClient.js";
import { createVisionService } from "../src/services/visionService.js";
import { fakeImage, sparkHazard } from "./helpers.js";

const image = fakeImage();
const timing = { budgetMs: 2_000, sparkTimeoutMs: 200, samTimeoutMs: 100, maxRetryDelayMs: 5 };
const unlimited = { tryConsume: async () => true };

const genericBathroom: Fixture = {
  roomType: "bathroom",
  hazards: [{ ...sparkHazard({ id: "h1", label_en: "wet floor" }), region: null } as never],
};
const fixtures = createFixtureStore({ generic: { bathroom: genericBathroom } });

const spark = (...hazards: Record<string, unknown>[]) => ({ room_type: "bathroom", hazards });

function client(overrides: Partial<MetaClient>): MetaClient {
  return {
    detectHazards: async () => spark(sparkHazard()),
    segment: async () => null,
    ...overrides,
  };
}

describe("visionService live path", () => {
  it("joins Spark and SAM by hazard id and normalizes pixel regions", async () => {
    const segment = vi.fn(async (_img, label: string) =>
      label === "loose rug"
        ? { kind: "bbox" as const, box: [100, 50, 200, 100] as [number, number, number, number] }
        : null,
    );
    const vision = createVisionService({
      client: client({
        detectHazards: async () =>
          spark(sparkHazard(), sparkHazard({ id: "h2", label_en: "wet floor" })),
        segment,
      }),
      fixtures,
      usage: unlimited,
      timing,
    });

    const result = await vision.analyze(image, "bathroom", "es");

    expect(result.source).toBe("live");
    expect(segment).toHaveBeenCalledTimes(2);
    expect(result.hazards.map((h) => [h.id, h.region])).toEqual([
      ["h1", { type: "bbox", points: [0.1, 0.1, 0.2, 0.2] }],
      ["h2", null],
    ]);
  });

  it("keeps a hazard without region when its segmentation fails", async () => {
    const vision = createVisionService({
      client: client({
        segment: async () => {
          throw new Error("boom");
        },
      }),
      fixtures,
      usage: unlimited,
      timing,
    });
    const result = await vision.analyze(image, "bathroom", "es");
    expect(result.source).toBe("live");
    expect(result.hazards).toHaveLength(1);
    expect(result.hazards[0]?.region).toBeNull();
  });

  it("extracts JSON wrapped in prose", async () => {
    const vision = createVisionService({
      client: client({
        detectHazards: async () =>
          `Sure!\n\`\`\`json\n${JSON.stringify(spark(sparkHazard()))}\n\`\`\``,
      }),
      fixtures,
      usage: unlimited,
      timing,
    });
    expect((await vision.analyze(image, "bathroom", "es")).source).toBe("live");
  });

  it("retries once with a strict reminder after invalid JSON", async () => {
    const detectHazards = vi
      .fn<MetaClient["detectHazards"]>()
      .mockResolvedValueOnce("not json")
      .mockResolvedValueOnce(spark(sparkHazard()));
    const vision = createVisionService({
      client: client({ detectHazards }),
      fixtures,
      usage: unlimited,
      timing,
    });

    const result = await vision.analyze(image, "bathroom", "es");

    expect(result.source).toBe("live");
    expect(detectHazards.mock.calls.map((c) => c[2].strict)).toEqual([false, true]);
  });

  it("retries on 429 honoring Retry-After", async () => {
    const detectHazards = vi
      .fn<MetaClient["detectHazards"]>()
      .mockRejectedValueOnce(new ProviderError("rate_limited", "429", 1))
      .mockResolvedValueOnce(spark(sparkHazard()));
    const vision = createVisionService({
      client: client({ detectHazards }),
      fixtures,
      usage: unlimited,
      timing,
    });
    expect((await vision.analyze(image, "bathroom", "es")).source).toBe("live");
    expect(detectHazards).toHaveBeenCalledTimes(2);
  });
});

describe("visionService fallback ladder", () => {
  it.each([
    ["persistent invalid JSON", async () => "nope"],
    [
      "repeated 429",
      async () => {
        throw new ProviderError("rate_limited", "429", 1);
      },
    ],
    [
      "timeout",
      (_img: unknown, _hint: unknown, opts: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) =>
          opts.signal.addEventListener("abort", () => reject(opts.signal.reason)),
        ),
    ],
  ])("returns a retryable 502, not another room's sample, on %s", async (_name, detectHazards) => {
    const vision = createVisionService({
      client: client({ detectHazards: detectHazards as MetaClient["detectHazards"] }),
      fixtures,
      usage: unlimited,
      timing,
    });
    await expect(vision.analyze(image, "bathroom", "es")).rejects.toMatchObject({
      code: "AI_PROVIDER_ERROR",
      status: 502,
    });
  });

  it("prefers a cached real response matching the image hash", async () => {
    const cached: Fixture = {
      roomType: "bathroom",
      hazards: [{ ...sparkHazard(), region: { type: "bbox", points: [0, 0, 0.5, 0.5] } } as never],
    };
    const vision = createVisionService({
      client: client({
        detectHazards: async () => {
          throw new ProviderError("unavailable");
        },
      }),
      fixtures: createFixtureStore({
        cached: { [image.sha256]: cached },
        generic: { bathroom: genericBathroom },
      }),
      usage: unlimited,
      timing,
    });
    const result = await vision.analyze(image, "bathroom", "es");
    expect(result.source).toBe("cached");
    expect(result.hazards[0]?.region).toEqual({ type: "bbox", points: [0, 0, 0.5, 0.5] });
  });

  it("degrades without calling the model when the daily cap is reached", async () => {
    const detectHazards = vi.fn<MetaClient["detectHazards"]>();
    const vision = createVisionService({
      client: client({ detectHazards }),
      fixtures,
      usage: { tryConsume: async () => false },
      timing,
    });
    await expect(vision.analyze(image, "bathroom", "es")).rejects.toMatchObject({
      code: "AI_PROVIDER_ERROR",
    });
    expect(detectHazards).not.toHaveBeenCalled();
  });

  it("never labels mock mode as live", async () => {
    const vision = createVisionService({ client: null, fixtures, usage: unlimited, timing });
    expect((await vision.analyze(image, "bathroom", "es")).source).toBe("mock");
  });

  it("falls back to the generic 'other' fixture for room types without one", async () => {
    const other: Fixture = { roomType: "other", hazards: [] };
    const vision = createVisionService({
      client: null,
      fixtures: createFixtureStore({ generic: { other } }),
      usage: unlimited,
      timing,
    });
    expect(await vision.analyze(image, "kitchen", "es")).toEqual({
      source: "mock",
      language: "es",
      hazards: [],
    });
  });

  it("serves a fallback in the requested language, else Spanish, and says which", async () => {
    const es: Fixture = { roomType: "bathroom", hazards: [] };
    const pt: Fixture = { roomType: "bathroom", hazards: [sparkHazard() as never] };
    const vision = createVisionService({
      client: null,
      fixtures: createFixtureStore({ cached: { [image.sha256]: { es, pt } } }),
      usage: unlimited,
      timing,
    });
    const inPt = await vision.analyze(image, "bathroom", "pt");
    expect([inPt.source, inPt.language, inPt.hazards.length]).toEqual(["cached", "pt", 1]);
    const inEn = await vision.analyze(image, "bathroom", "en");
    expect([inEn.source, inEn.language, inEn.hazards.length]).toEqual(["cached", "es", 0]);
  });

  it("reports the live result in the language it asked the model for", async () => {
    const detectHazards = vi.fn(async () => spark(sparkHazard()));
    const vision = createVisionService({
      client: client({ detectHazards }),
      fixtures,
      usage: unlimited,
      timing,
    });
    const result = await vision.analyze(image, "bathroom", "en");
    expect(result.language).toBe("en");
    expect(detectHazards).toHaveBeenCalledWith(
      image,
      "bathroom",
      expect.objectContaining({ lang: "en" }),
    );
  });

  it("returns 502 only when there is no fallback at all", async () => {
    const vision = createVisionService({
      client: null,
      fixtures: createFixtureStore({}),
      usage: unlimited,
      timing,
    });
    await expect(vision.analyze(image, "bathroom", "es")).rejects.toMatchObject({ status: 502 });
  });
});
