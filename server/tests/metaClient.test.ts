import { afterEach, describe, expect, it, vi } from "vitest";
import { createFixtureStore } from "../src/lib/fixtures.js";
import { createMetaClient, ProviderError } from "../src/lib/metaClient.js";
import { sparkBoxToSegmentation } from "../src/lib/regions.js";
import { createVisionService } from "../src/services/visionService.js";
import { fakeImage, sparkHazard } from "./helpers.js";

const image = fakeImage();
const config = {
  META_API_KEY: "test-key",
  META_API_BASE_URL: "https://api.example.test/v1/",
  META_MODEL_SPARK: "muse-spark-1.3",
};
const opts = { signal: new AbortController().signal, strict: false };

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
    const result = await vision.analyze(image, "bathroom");

    expect(result.source).toBe("live");
    expect(result.hazards[0]?.region).toEqual({ type: "bbox", points: [0, 0, 0.5, 1] });
    expect(result.hazards[1]?.region).toBeNull();
    expect(usage.tryConsume).toHaveBeenCalledTimes(1); // no SAM calls reserved
  });
});
