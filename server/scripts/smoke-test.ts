// Post-deploy smoke test (docs/API_SPECS.md §4):
//   npm run smoke-test -w server -- https://<backend> [path/to/room.jpg]
// Without an image it uploads a generated one. Always deletes the household it creates.
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { z } from "zod";
import { RegionSchema } from "../src/schemas/ai.js";
import { ANALYSIS_SOURCES, ROOM_TYPES, SEVERITIES } from "../src/schemas/enums.js";

const RoomResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(ROOM_TYPES),
  source: z.enum(ANALYSIS_SOURCES),
  notice: z.string().optional(),
  imageWidth: z.number().int().positive(),
  imageHeight: z.number().int().positive(),
  hazards: z.array(
    z.object({
      id: z.uuid(),
      severity: z.enum(SEVERITIES),
      labelEs: z.string(),
      fixEs: z.string(),
      region: RegionSchema.nullable(),
    }),
  ),
});

const [baseArg, imagePath] = process.argv.slice(2);
if (!baseArg) {
  console.error("usage: smoke-test <backend-url> [image.jpg]");
  process.exit(2);
}
const base = baseArg.replace(/\/+$/, "");

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  console.log(`  ok  ${name} (${Math.round(performance.now() - start)} ms)`);
  return result;
}

async function main() {
  console.log(`smoke test → ${base}`);

  // Generous timeout: a sleeping free Render instance can take ~50 s to wake.
  await step("GET /health", async () => {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(90_000) });
    check(res.status === 200, `health returned ${res.status}`);
  });

  const household = await step("POST /api/households", async () => {
    const res = await fetch(`${base}/api/households`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Smoke test" }),
    });
    check(res.status === 201, `create household returned ${res.status}`);
    return z.object({ token: z.uuid(), assessmentId: z.uuid() }).parse(await res.json());
  });
  const auth = { "X-Household-Token": household.token };

  try {
    const room = await step("POST /api/assessments/:id/rooms", async () => {
      const image = imagePath
        ? await readFile(imagePath)
        : await sharp({ create: { width: 1280, height: 960, channels: 3, background: "#b0a090" } })
            .jpeg()
            .toBuffer();
      const form = new FormData();
      form.set("roomType", "bathroom");
      form.set("image", new Blob([new Uint8Array(image)], { type: "image/jpeg" }), "room.jpg");
      const res = await fetch(`${base}/api/assessments/${household.assessmentId}/rooms`, {
        method: "POST",
        headers: auth,
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
      check(res.status === 201, `room upload returned ${res.status}`);
      return RoomResponseSchema.parse(await res.json());
    });
    check(room.source === "live" || room.notice, "non-live result without a notice");
    console.log(`      source=${room.source} hazards=${room.hazards.length}`);

    await step("GET /api/assessments/:id", async () => {
      const res = await fetch(`${base}/api/assessments/${household.assessmentId}`, {
        headers: auth,
      });
      check(res.status === 200, `get assessment returned ${res.status}`);
    });
  } finally {
    await step("DELETE /api/households/me", async () => {
      const res = await fetch(`${base}/api/households/me`, { method: "DELETE", headers: auth });
      check(res.status === 204, `delete returned ${res.status}`);
    });
  }

  console.log("smoke test passed");
}

main().catch((err: unknown) => {
  console.error(`smoke test FAILED: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
