import type { Config } from "../config/env.js";
import type { RoomTypeValue } from "../schemas/enums.js";
import type { NormalizedImage } from "./imagePipeline.js";

export type ProviderErrorKind =
  "rate_limited" | "timeout" | "invalid_output" | "unavailable" | "spend_cap";

/** A failure on the AI side. Never a client fault: it triggers the fallback ladder. */
export class ProviderError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    message: string = kind,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/**
 * Segmentation in pixel space of the normalized image. The real adapter converts whatever
 * SAM 3.1 returns into this shape; `toNormalizedRegion` then maps it to 0–1.
 * bbox = [x, y, width, height]; polygon = flat [x1, y1, x2, y2, …].
 */
export type RawSegmentation =
  { kind: "bbox"; box: [number, number, number, number] } | { kind: "polygon"; points: number[] };

export interface DetectOptions {
  signal: AbortSignal;
  /** Set on the retry after invalid JSON: adds a "return only valid JSON" reminder. */
  strict: boolean;
}

export interface MetaClient {
  /** Raw model output (string or parsed JSON); validated by the caller. */
  detectHazards(img: NormalizedImage, hint: RoomTypeValue, opts: DetectOptions): Promise<unknown>;
  segment(
    img: NormalizedImage,
    label: string,
    signal: AbortSignal,
  ): Promise<RawSegmentation | null>;
}

type MetaConfig = Pick<
  Config,
  "META_API_KEY" | "META_API_BASE_URL" | "META_MODEL_SPARK" | "META_MODEL_SAM"
>;

/**
 * Meta Model API client. Endpoints, auth and the SAM 3.1 input/output format are still
 * unverified (docs/AI_INTEGRATION.md §10), so calls fail as `unavailable` and the request
 * degrades to the labeled fallback instead of guessing an API.
 */
export function createMetaClient(_config: MetaConfig): MetaClient {
  const notWired = async (): Promise<never> => {
    throw new ProviderError("unavailable", "Meta Model API client not wired yet");
  };
  return { detectHazards: notWired, segment: notWired };
}
