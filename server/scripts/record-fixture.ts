// Records a real live analysis as a cached fixture (docs/AI_INTEGRATION.md §7):
//   npm run record-fixture -w server -- <image> <room_type>
// Writes fixtures/<sha256-of-normalized-image>.json only when the result is live. Use images you
// own: fixtures are committed to a public repo.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../src/config/env.js";
import { createFixtureStore, FixtureSchema } from "../src/lib/fixtures.js";
import { normalizeImage } from "../src/lib/imagePipeline.js";
import { createMetaClient } from "../src/lib/metaClient.js";
import { ROOM_TYPES, type RoomTypeValue } from "../src/schemas/enums.js";
import { createVisionService } from "../src/services/visionService.js";

const [imagePath, roomType] = process.argv.slice(2);
if (!imagePath || !(ROOM_TYPES as readonly string[]).includes(roomType ?? "")) {
  console.error(`usage: record-fixture <image> <${ROOM_TYPES.join("|")}>`);
  process.exit(2);
}

const config = loadConfig();
if (config.MOCK_AI) {
  console.error("MOCK_AI is on: a fixture must come from a live call");
  process.exit(1);
}

const image = await normalizeImage(await readFile(imagePath));
const vision = createVisionService({
  client: createMetaClient(config),
  fixtures: createFixtureStore({}), // no fallback data: a failure can't be recorded as real
  usage: { tryConsume: async () => true },
});

const result = await vision.analyze(image, roomType as RoomTypeValue).catch(() => null);
if (result?.source !== "live") {
  console.error("live analysis failed; nothing recorded");
  process.exit(1);
}

const fixture = FixtureSchema.parse({ roomType, hazards: result.hazards });
const out = fileURLToPath(new URL(`../fixtures/${image.sha256}.json`, import.meta.url));
await writeFile(out, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`recorded ${fixture.hazards.length} hazards → fixtures/${image.sha256}.json`);
