// Records a real live analysis as a cached fixture (docs/AI_INTEGRATION.md §7):
//   npm run record-fixture -w server -- <image> <room_type> [es|pt|en]
// Writes fixtures/<sha256-of-normalized-image>[.<lang>].json only when the result is live
// (no suffix for Spanish). Use images you
// own: fixtures are committed to a public repo.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../src/config/env.js";
import { createFixtureStore, FixtureSchema } from "../src/lib/fixtures.js";
import { normalizeImage } from "../src/lib/imagePipeline.js";
import { createMetaClient } from "../src/lib/metaClient.js";
import {
  LANGUAGES,
  ROOM_TYPES,
  type LanguageValue,
  type RoomTypeValue,
} from "../src/schemas/enums.js";
import { createVisionService } from "../src/services/visionService.js";

const [imagePath, roomType, langArg = "es"] = process.argv.slice(2);
if (
  !imagePath ||
  !(ROOM_TYPES as readonly string[]).includes(roomType ?? "") ||
  !(LANGUAGES as readonly string[]).includes(langArg)
) {
  console.error(`usage: record-fixture <image> <${ROOM_TYPES.join("|")}> [${LANGUAGES.join("|")}]`);
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

const lang = langArg as LanguageValue;
const result = await vision.analyze(image, roomType as RoomTypeValue, lang).catch(() => null);
if (result?.source !== "live") {
  console.error("live analysis failed; nothing recorded");
  process.exit(1);
}

const fixture = FixtureSchema.parse({ roomType, hazards: result.hazards });
const file = `${image.sha256}${lang === "es" ? "" : `.${lang}`}.json`;
const out = fileURLToPath(new URL(`../fixtures/${file}`, import.meta.url));
await writeFile(out, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`recorded ${fixture.hazards.length} hazards → fixtures/${file}`);
