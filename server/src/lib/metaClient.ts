import type { Config } from "../config/env.js";
import type { RoomTypeValue } from "../schemas/enums.js";
import type { NormalizedImage } from "./imagePipeline.js";
import { SPARK_OUTPUT_JSON_SCHEMA, SPARK_SYSTEM_PROMPT, sparkUserMessage } from "./sparkPrompt.js";

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
  /** Absent while SAM is not wired: regions then come from Spark's own boxes. */
  segment?(
    img: NormalizedImage,
    label: string,
    signal: AbortSignal,
  ): Promise<RawSegmentation | null>;
}

type MetaConfig = Pick<Config, "META_API_KEY" | "META_API_BASE_URL" | "META_MODEL_SPARK">;

function retryAfterMs(res: Response): number | undefined {
  const seconds = Number(res.headers.get("retry-after"));
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined;
}

/** Maps transport failures to ProviderError kinds. Bodies are never logged (they may echo input). */
async function post(url: string, apiKey: string, body: unknown, signal: AbortSignal) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
      throw new ProviderError("timeout");
    }
    throw new ProviderError("unavailable", "network error");
  }
  if (res.status === 429) {
    throw new ProviderError("rate_limited", "HTTP 429", retryAfterMs(res));
  }
  if (!res.ok) throw new ProviderError("unavailable", `HTTP ${res.status}`);
  return res.json() as Promise<unknown>;
}

/**
 * Meta Model API client (OpenAI-compatible, https://api.meta.ai/v1, Bearer auth).
 * Muse Spark runs over Chat Completions with a JSON schema in `response_format`, so decoding
 * is constrained; the caller still validates with Zod.
 */
export function createMetaClient(config: MetaConfig): MetaClient {
  const { META_API_KEY: apiKey, META_API_BASE_URL: baseUrl, META_MODEL_SPARK: sparkModel } = config;
  if (!apiKey || !baseUrl || !sparkModel) throw new Error("Meta API configuration is incomplete");
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  return {
    async detectHazards(img, hint, { signal, strict }) {
      const dataUrl = `data:image/jpeg;base64,${img.buffer.toString("base64")}`;
      const json = await post(
        endpoint,
        apiKey,
        {
          model: sparkModel,
          messages: [
            { role: "system", content: SPARK_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: sparkUserMessage(hint, strict) },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "HomeHazards", schema: SPARK_OUTPUT_JSON_SCHEMA },
          },
        },
        signal,
      );
      const content = (json as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]
        ?.message?.content;
      if (typeof content !== "string") throw new ProviderError("invalid_output", "no content");
      return content;
    },
  };
}
