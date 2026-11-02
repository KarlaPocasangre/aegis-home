import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixtureStore } from "../src/lib/fixtures.js";
import { createMetaClient, ProviderError } from "../src/lib/metaClient.js";
import { sparkBoxToSegmentation } from "../src/lib/regions.js";
import { maskToPolygon, parseSamBoxes, parseSamMasks, pickSamBox } from "../src/lib/samOutput.js";
import { createVisionService } from "../src/services/visionService.js";
import { fakeImage, sparkHazard } from "./helpers.js";

const image = fakeImage();
const config = {
  META_API_KEY: "test-key",
  META_API_BASE_URL: "https://api.example.test/v1/",
  META_MODEL_SPARK: "muse-spark-1.3",
  META_MODEL_SAM: "sam-3.1",
};
const opts = { signal: new AbortController().signal, strict: false, lang: "es" as const };

afterEach(() => vi.unstubAllGlobals());

function stubFetch(res: Response) {
  const fetchMock = vi.fn(async () => res);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("createMetaClient", () => {
  it("sends the image as a data URL with a JSON schema and returns the content", async () => {
    const fetchMock = stubFetch(
      Response.json({
        choices: [{ message: { content: '{"room_type":"bathroom","hazards":[]}' } }],
      }),
    );
    const out = await createMetaClient(config).detectHazards(image, "bathroom", opts);

    expect(out).toBe('{"room_type":"bathroom","hazards":[]}');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("muse-spark-1.3");
    expect(body.response_format.type).toBe("json_schema");
    expect(body.messages[1].content[1].image_url.url).toMatch(/^data:image\/jpeg;base64,/);
    expect(body.messages[0].content).toContain("neutral Latin American Spanish");
  });

  it("asks for the hazard text in the requested language", async () => {
    const fetchMock = stubFetch(Response.json({ choices: [{ message: { content: "{}" } }] }));
    await createMetaClient(config).detectHazards(image, "bathroom", { ...opts, lang: "pt" });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(body.messages[0].content).toContain("Brazilian Portuguese");
    expect(body.messages[0].content).not.toContain("{LANGUAGE}");
    expect(body.messages[1].content[0].text).toContain("Brazilian Portuguese");
  });

  it("maps 429 to rate_limited with Retry-After", async () => {
    stubFetch(new Response("{}", { status: 429, headers: { "retry-after": "2" } }));
    const err = await createMetaClient(config)
      .detectHazards(image, "bathroom", opts)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ProviderError);
    expect(err).toMatchObject({ kind: "rate_limited", retryAfterMs: 2000 });
  });

  it("maps other HTTP errors to unavailable", async () => {
    stubFetch(new Response("{}", { status: 500 }));
    await expect(
      createMetaClient(config).detectHazards(image, "bathroom", opts),
    ).rejects.toMatchObject({ kind: "unavailable" });
  });
});

const SAM_LINE =
  "<0f>0<|box;x1=100;y1=50;x2=199;y2=149;w=1000;h=500;c=0.5|><|mask;x=0;y=0;c=0.5;data=2,2,!a~b|>," +
  "2<|box;x1=600;y1=200;x2=899;y2=399;w=1000;h=500;c=0.9|><|mask;x=0;y=0;c=0.9;data=2,2,!x|>";

// Real SAM 3.1 output format (frame 0, prompt "button", two objects), from @meta-sam/parser's README.
const SAM_MASK_LINE =
  "<0f>0<|box;x1=211;y1=228;x2=270;y2=254;w=320;h=334|>" +
  "<|mask;x=0;y=0;data=27,60,~!!!!M!0c[0o91w?q1!pIH4pPRVp2B3'7`e.ioeAf6-k/#Xd8%dX9x(|>" +
  ",1<|box;x1=155;y1=228;x2=202;y2=254;w=320;h=334|>" +
  "<|mask;x=0;y=0;data=27,48,~!!!!J!0c[q=Pj_zs=*4C4(/./x#:/`S_GnD`=o3?X{emCgO$y@|>\n";

describe("SAM 3.1 output", () => {
  it("reads boxes by key, with or without confidence, skipping malformed ones", () => {
    const boxes = parseSamBoxes(SAM_LINE + ",3<|box;x1=a;y1=0;x2=1;y2=1;w=10;h=10|><|mask;|>");
    expect(boxes).toEqual([
      { id: "0", x1: 100, y1: 50, x2: 199, y2: 149, w: 1000, h: 500, c: 0.5 },
      { id: "2", x1: 600, y1: 200, x2: 899, y2: 399, w: 1000, h: 500, c: 0.9 },
    ]);
    expect(parseSamBoxes("")).toEqual([]);
  });

  it("picks the instance overlapping Spark's box, else the most confident", () => {
    const boxes = parseSamBoxes(SAM_LINE);
    const size = { width: 1000, height: 500 };
    expect(pickSamBox(boxes, size, [90, 40, 120, 120])?.rect).toEqual([100, 50, 100, 100]);
    expect(pickSamBox(boxes, size)).toMatchObject({ box: { id: "2" }, rect: [600, 200, 300, 200] });
    expect(pickSamBox(boxes, size, [0, 400, 10, 10])).toBeNull();
    // Rescales when SAM reports a different source size.
    expect(pickSamBox(boxes, { width: 500, height: 250 })?.rect).toEqual([300, 100, 150, 100]);
  });

  it("outlines the chosen instance's mask as a pixel polygon inside its box", async () => {
    const masks = await parseSamMasks(SAM_MASK_LINE);
    expect([...masks.keys()]).toEqual(["0", "1"]);
    const [box] = parseSamBoxes(SAM_MASK_LINE);
    const points = maskToPolygon(masks.get("0")!, box!, { width: 320, height: 334 })!;

    expect(points.length).toBeGreaterThanOrEqual(6);
    expect(points.length / 2).toBeLessThanOrEqual(100);
    points.forEach((v, i) => {
      if (i % 2 === 0) expect(v).toSatisfy((x: number) => x >= 211 && x <= 271);
      else expect(v).toSatisfy((y: number) => y >= 228 && y <= 255);
    });
    // Same mask on an image half the size SAM saw: coordinates halve.
    const half = maskToPolygon(masks.get("0")!, box!, { width: 160, height: 167 })!;
    expect(half[0]).toBeCloseTo(points[0]! / 2);
  });

  it("ignores malformed masks", async () => {
    expect((await parseSamMasks(SAM_LINE)).size).toBe(0);
    expect((await parseSamMasks("")).size).toBe(0);
  });

  it("segments via the Responses API with the label as a concept prompt", async () => {
    const fetchMock = stubFetch(
      Response.json({ output: [{ content: [{ type: "output_text", text: SAM_LINE }] }] }),
    );
    const seg = await createMetaClient(config).segment!(
      image,
      "loose rug",
      new AbortController().signal,
      [90, 40, 120, 120],
    );

    expect(seg).toEqual({ kind: "bbox", box: [100, 50, 100, 100] });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/v1/responses");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("sam-3.1");
    expect(body.input[0].content[0]).toEqual({ type: "input_text", text: "loose rug" });
    expect(body.metadata.include_confidence).toBe("true");
  });

  it("returns the mask outline as a polygon when SAM sends a valid mask", async () => {
    stubFetch(
      Response.json({ output: [{ content: [{ type: "output_text", text: SAM_MASK_LINE }] }] }),
    );
    const seg = await createMetaClient(config).segment!(
      { ...image, width: 320, height: 334 },
      "button",
      new AbortController().signal,
      [210, 225, 62, 30],
    );
    expect(seg?.kind).toBe("polygon");
  });

  it("returns every instance of a concept for segmentAll", async () => {
    stubFetch(
      Response.json({ output: [{ content: [{ type: "output_text", text: SAM_MASK_LINE }] }] }),
    );
    const segs = await createMetaClient(config).segmentAll!(
      { ...image, width: 320, height: 334 },
      "floor",
      new AbortController().signal,
    );
    expect(segs.map((s) => s.kind)).toEqual(["polygon", "polygon"]);
  });

  it("treats zero matches as no region", async () => {
    stubFetch(Response.json({ output: [] }));
    const seg = await createMetaClient(config).segment!(
      image,
      "grab bar",
      new AbortController().signal,
    );
    expect(seg).toBeNull();
  });
});

describe("Spark grounding boxes", () => {
  it("converts a 0–1000 box to a pixel bbox and rejects empty ones", () => {
    expect(sparkBoxToSegmentation([100, 200, 300, 400], { width: 1000, height: 500 })).toEqual({
      kind: "bbox",
      box: [100, 100, 200, 100],
    });
    expect(sparkBoxToSegmentation([500, 0, 400, 10], { width: 1000, height: 500 })).toBeNull();
    expect(sparkBoxToSegmentation(undefined, { width: 1000, height: 500 })).toBeNull();
  });

  it("uses Spark's box as the region when SAM is not wired", async () => {
    const usage = { tryConsume: vi.fn(async () => true) };
    const vision = createVisionService({
      client: {
        detectHazards: async () => ({
          room_type: "bathroom",
          hazards: [sparkHazard({ box: [0, 0, 500, 1001] }), sparkHazard({ id: "h2", box: "x" })],
        }),
      },
      fixtures: createFixtureStore({}),
      usage,
    });
    const result = await vision.analyze(image, "bathroom", "es");

    expect(result.source).toBe("live");
    expect(result.hazards[0]?.region).toEqual({ type: "bbox", points: [0, 0, 0.5, 1] });
    expect(result.hazards[1]?.region).toBeNull();
    expect(usage.tryConsume).toHaveBeenCalledTimes(1); // no SAM calls reserved
  });
});
