import { describe, expect, it } from "vitest";
import { RegionSchema, SparkOutputSchema } from "../src/schemas/ai.js";
import { sparkHazard as hazard } from "./helpers.js";

describe("SparkOutputSchema", () => {
  it("accepts a valid response and strips unknown keys", () => {
    const parsed = SparkOutputSchema.parse({
      room_type: "bathroom",
      hazards: [hazard({ extra: "<script>" })],
      note: "ignored",
    });
    expect(parsed.hazards[0]).not.toHaveProperty("extra");
    expect(parsed).not.toHaveProperty("note");
  });

  it("accepts an empty hazard list", () => {
    expect(SparkOutputSchema.safeParse({ room_type: "kitchen", hazards: [] }).success).toBe(true);
  });

  it.each([
    ["unknown room type", { room_type: "garage", hazards: [] }],
    ["bad severity", { room_type: "bathroom", hazards: [hazard({ severity: "critical" })] }],
    ["bad id format", { room_type: "bathroom", hazards: [hazard({ id: "hazard-1" })] }],
    ["oversized text", { room_type: "bathroom", hazards: [hazard({ fix_es: "x".repeat(301) })] }],
    ["confidence > 1", { room_type: "bathroom", hazards: [hazard({ confidence: 1.5 })] }],
    ["negative cost", { room_type: "bathroom", hazards: [hazard({ cost_estimate_usd: -1 })] }],
    [
      "too many hazards",
      {
        room_type: "bathroom",
        hazards: Array.from({ length: 9 }, (_, i) => hazard({ id: `h${i + 1}` })),
      },
    ],
    ["duplicate ids", { room_type: "bathroom", hazards: [hazard(), hazard()] }],
  ])("rejects %s", (_name, input) => {
    expect(SparkOutputSchema.safeParse(input).success).toBe(false);
  });
});

describe("RegionSchema", () => {
  it("accepts a normalized bbox and polygon", () => {
    expect(RegionSchema.safeParse({ type: "bbox", points: [0.1, 0.2, 0.3, 0.4] }).success).toBe(
      true,
    );
    expect(
      RegionSchema.safeParse({ type: "polygon", points: [0.1, 0.5, 0.4, 0.52, 0.38, 0.7] }).success,
    ).toBe(true);
  });

  it.each([
    ["bbox with 3 values", { type: "bbox", points: [0.1, 0.2, 0.3] }],
    ["value above 1", { type: "bbox", points: [0.1, 0.2, 1.3, 0.4] }],
    ["non-finite value", { type: "bbox", points: [0.1, 0.2, Number.NaN, 0.4] }],
    ["odd polygon", { type: "polygon", points: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7] }],
    ["unknown type", { type: "mask", points: [0.1, 0.2, 0.3, 0.4] }],
  ])("rejects %s", (_name, input) => {
    expect(RegionSchema.safeParse(input).success).toBe(false);
  });
});
