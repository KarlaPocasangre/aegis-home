import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadFixtures } from "../src/lib/fixtures.js";
import { normalizeImage } from "../src/lib/imagePipeline.js";

const fixtures = loadFixtures(fileURLToPath(new URL("../fixtures", import.meta.url)));
const sample = (name: string) =>
  fileURLToPath(new URL(`../../client/public/samples/${name}`, import.meta.url));

// The client uploads samples byte-for-byte, so the server hash must hit the recorded fixture.
// A failure here usually means sharp's output changed: re-record with `npm run record-fixture`.
describe("recorded sample fixtures", () => {
  it.each([
    ["bathroom-wet-floor.jpg", "bathroom"],
    ["stairs-no-handrail.jpg", "stairs"],
  ])("%s matches its cached fixture", async (file, roomType) => {
    const image = await normalizeImage(await readFile(sample(file)));
    expect(fixtures.byHash(image.sha256)?.roomType).toBe(roomType);
    // Recorded in every app language, so a sample falls back in the visitor's language.
    for (const lang of ["es", "pt", "en"] as const) {
      expect(fixtures.byHash(image.sha256, lang)?.language).toBe(lang);
    }
  });
});
