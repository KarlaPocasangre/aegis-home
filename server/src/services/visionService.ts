import { mapWithConcurrency, sleep, withTimeout } from "../lib/async.js";
import { floorShare, rasterizeFloor } from "../lib/floorShare.js";
import type { Fixture, FixtureStore } from "../lib/fixtures.js";
import { HttpError } from "../lib/httpError.js";
import type { NormalizedImage } from "../lib/imagePipeline.js";
import { extractJsonObject } from "../lib/json.js";
import { ProviderError, type MetaClient } from "../lib/metaClient.js";
import { sparkBoxToSegmentation, toNormalizedRegion } from "../lib/regions.js";
import {
  SparkOutputSchema,
  type Region,
  type SparkHazard,
  type SparkOutput,
} from "../schemas/ai.js";
import type { AnalysisSourceValue, LanguageValue, RoomTypeValue } from "../schemas/enums.js";
import type { UsageService } from "./usageService.js";

export interface AnalyzedHazard extends SparkHazard {
  region: Region | null;
  /** Share (0–1) of the visible floor this hazard covers; null when not measurable. */
  floor_share: number | null;
}

export interface AnalysisResult {
  source: AnalysisSourceValue;
  /** Language the hazard text is actually in (a fallback may differ from the one asked for). */
  language: LanguageValue;
  hazards: AnalyzedHazard[];
}

export interface VisionService {
  analyze(
    image: NormalizedImage,
    hint: RoomTypeValue,
    lang: LanguageValue,
  ): Promise<AnalysisResult>;
}

// docs/AI_INTEGRATION.md §3.2 — suggestions; tune after measuring real latency.
export interface VisionTiming {
  budgetMs: number;
  sparkTimeoutMs: number;
  samTimeoutMs: number;
  maxRetryDelayMs: number;
}

const DEFAULT_TIMING: VisionTiming = {
  budgetMs: 55_000,
  // Measured 13–22 s on a 1024 px photo (Nov 1); headroom so a slow answer isn't lost.
  sparkTimeoutMs: 35_000,
  samTimeoutMs: 10_000,
  maxRetryDelayMs: 8_000,
};
const SAM_CONCURRENCY = 4;
const INVALID_JSON_RETRIES = 1;
const RATE_LIMIT_RETRIES = 2;

export interface VisionDeps {
  /** null when MOCK_AI is on: every analysis goes straight to the labeled fallback. */
  client: MetaClient | null;
  fixtures: FixtureStore;
  usage: UsageService;
  timing?: Partial<VisionTiming>;
}

function failureKind(err: unknown): string {
  if (err instanceof ProviderError) return err.kind;
  if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
    return "timeout";
  }
  return "unexpected";
}

// Fixtures recorded before the floor metric have no share.
const withShare = (fixture: Fixture): AnalyzedHazard[] =>
  fixture.hazards.map((h) => ({ ...h, floor_share: h.floor_share ?? null }));

export function createVisionService(deps: VisionDeps): VisionService {
  const { client, fixtures, usage } = deps;
  const timing = { ...DEFAULT_TIMING, ...deps.timing };

  async function consume(calls: number) {
    if (!(await usage.tryConsume(calls))) throw new ProviderError("spend_cap");
  }

  async function detect(
    ai: MetaClient,
    image: NormalizedImage,
    hint: RoomTypeValue,
    lang: LanguageValue,
    budget: AbortSignal,
  ): Promise<SparkOutput> {
    let invalidRetries = INVALID_JSON_RETRIES;
    let rateRetries = RATE_LIMIT_RETRIES;
    let backoffMs = 1_000;
    let strict = false;

    for (;;) {
      await consume(1);
      try {
        const signal = withTimeout(budget, timing.sparkTimeoutMs);
        const raw = await ai.detectHazards(image, hint, { signal, strict, lang });
        const parsed = SparkOutputSchema.safeParse(extractJsonObject(raw));
        if (parsed.success) return parsed.data;
        if (invalidRetries-- <= 0) throw new ProviderError("invalid_output");
        strict = true;
      } catch (err) {
        if (err instanceof ProviderError && err.kind === "rate_limited" && rateRetries-- > 0) {
          await sleep(Math.min(err.retryAfterMs ?? backoffMs, timing.maxRetryDelayMs), budget);
          backoffMs *= 2;
          continue;
        }
        throw err;
      }
    }
  }

  async function segmentAll(
    ai: MetaClient,
    image: NormalizedImage,
    hazards: SparkHazard[],
    budget: AbortSignal,
  ): Promise<AnalyzedHazard[]> {
    const sparkBox = (hazard: SparkHazard) => sparkBoxToSegmentation(hazard.box, image);
    const fromBox = (hazard: SparkHazard) => {
      const seg = sparkBox(hazard);
      return seg ? toNormalizedRegion(seg, image) : null;
    };
    const segment = ai.segment?.bind(ai);
    // Spend cap hit after detection: keep the live hazards with Spark's boxes only (ladder level 2).
    const allowed =
      segment !== undefined && hazards.length > 0 && (await usage.tryConsume(hazards.length));
    // One extra SAM call for the floor, in parallel, only when a hazard lies on it.
    const floorTask =
      allowed && ai.segmentAll && hazards.some((h) => h.on_floor) && (await usage.tryConsume(1))
        ? segmentFloor(ai, image, budget)
        : Promise.resolve(null);
    const regions = await mapWithConcurrency(hazards, SAM_CONCURRENCY, async (hazard) => {
      if (!segment || !allowed) return fromBox(hazard);
      try {
        const near = sparkBox(hazard);
        const seg = await segment(
          image,
          hazard.label_en,
          withTimeout(budget, timing.samTimeoutMs),
          near?.kind === "bbox" ? near.box : undefined,
        );
        const region = seg ? toNormalizedRegion(seg, image) : null;
        return region ?? fromBox(hazard);
      } catch {
        return fromBox(hazard);
      }
    });
    const floor = await floorTask;
    // Only mask outlines are measured: a box overstates the area of most objects.
    const measured = (hazard: SparkHazard, region: Region | null): region is Region =>
      hazard.on_floor === true && (region?.type === "polygon" || region?.type === "multipolygon");
    // The walking surface is the floor plus every hazard lying on it: SAM's "floor" leaves out a
    // rug, so without it a pouf on that rug would be divided by a floor that is far too small.
    const walkway = floor
      ? rasterizeFloor([
          ...floor,
          ...hazards.flatMap((h, i) => (measured(h, regions[i] ?? null) ? [regions[i]!] : [])),
        ])
      : null;
    return hazards.map((hazard, i) => {
      const region = regions[i] ?? null;
      const share = walkway && measured(hazard, region) ? floorShare(region, walkway) : null;
      return { ...hazard, region, floor_share: share };
    });
  }

  /** Every "floor" instance SAM finds, normalized; null on failure or no floor. */
  async function segmentFloor(ai: MetaClient, image: NormalizedImage, budget: AbortSignal) {
    try {
      const segs = await ai.segmentAll!(image, "floor", withTimeout(budget, timing.samTimeoutMs));
      const regions = segs.flatMap((seg) => toNormalizedRegion(seg, image) ?? []);
      return regions.length > 0 ? regions : null;
    } catch {
      return null;
    }
  }

  function fallback(
    image: NormalizedImage,
    hint: RoomTypeValue,
    lang: LanguageValue,
  ): AnalysisResult {
    const cached = fixtures.byHash(image.sha256, lang);
    if (cached) return { source: "cached", language: cached.language, hazards: withShare(cached) };
    // Generic samples describe some other room. Shown on the user's own photo they read as a real
    // (wrong) analysis, so they are only for MOCK_AI mode; a live failure is an error to retry.
    if (client) throw new HttpError("AI_PROVIDER_ERROR");
    const generic = fixtures.generic(hint, lang);
    if (generic) return { source: "mock", language: generic.language, hazards: withShare(generic) };
    throw new HttpError("AI_PROVIDER_ERROR");
  }

  return {
    async analyze(image, hint, lang) {
      if (!client) return fallback(image, hint, lang);

      const budget = AbortSignal.timeout(timing.budgetMs);
      try {
        const spark = await detect(client, image, hint, lang, budget);
        // Joined by hazard id: each SAM call is prompted with that hazard's own label.
        return {
          source: "live",
          language: lang,
          hazards: await segmentAll(client, image, spark.hazards, budget),
        };
      } catch (err) {
        console.warn(`[analysis] live path failed (${failureKind(err)}), using fallback`);
        return fallback(image, hint, lang);
      }
    },
  };
}
