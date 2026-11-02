import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { HazardSchema, RegionSchema } from "../schemas/ai.js";
import { LANGUAGES, ROOM_TYPES, type LanguageValue, type RoomTypeValue } from "../schemas/enums.js";

// Fallback data (docs/AI_INTEGRATION.md §7):
//   <sha256>[.<lang>].json        recorded real response for a known normalized image → "cached"
//   generic-<room>[.<lang>].json  sample result per room type, regions null              → "mock"
// No language suffix means Spanish. A missing language falls back to Spanish, and the result
// says which language it is in.

export const FixtureSchema = z
  .object({
    roomType: z.enum(ROOM_TYPES),
    hazards: z
      .array(
        HazardSchema.extend({
          region: RegionSchema.nullable(),
          floor_share: z.number().min(0).max(1).nullable().optional(),
        }),
      )
      .max(8),
  })
  .refine((f) => new Set(f.hazards.map((h) => h.id)).size === f.hazards.length, {
    message: "hazard ids must be unique",
  });

export type Fixture = z.infer<typeof FixtureSchema>;

export interface LocalizedFixture extends Fixture {
  language: LanguageValue;
}

export interface FixtureStore {
  byHash(sha256: string, lang?: LanguageValue): LocalizedFixture | undefined;
  generic(roomType: RoomTypeValue, lang?: LanguageValue): LocalizedFixture | undefined;
}

const HASH_FILE = /^([a-f0-9]{64})(?:\.(es|pt|en))?\.json$/;
const GENERIC_FILE = /^generic-([a-z_]+)(?:\.(es|pt|en))?\.json$/;

type ByLang<T> = Partial<Record<LanguageValue, T>>;

function pick<T>(entry: ByLang<T> | undefined, lang: LanguageValue) {
  if (!entry) return undefined;
  const language = entry[lang] ? lang : entry.es ? "es" : undefined;
  return language ? { ...(entry[language] as T), language } : undefined;
}

/** Plain maps count as Spanish, so tests and older callers can pass fixtures directly. */
export function createFixtureStore(entries: {
  cached?: Record<string, Fixture | ByLang<Fixture>>;
  generic?: Partial<Record<RoomTypeValue, Fixture | ByLang<Fixture>>>;
}): FixtureStore {
  const asByLang = (v: Fixture | ByLang<Fixture>): ByLang<Fixture> =>
    "hazards" in v ? { es: v as Fixture } : (v as ByLang<Fixture>);
  const cached = new Map(Object.entries(entries.cached ?? {}).map(([k, v]) => [k, asByLang(v)]));
  const generic = Object.fromEntries(
    Object.entries(entries.generic ?? {}).map(([k, v]) => [k, asByLang(v as Fixture)]),
  ) as Partial<Record<RoomTypeValue, ByLang<Fixture>>>;
  return {
    byHash: (sha256, lang = "es") => pick(cached.get(sha256), lang),
    generic: (roomType, lang = "es") => pick(generic[roomType], lang) ?? pick(generic.other, lang),
  };
}

export function loadFixtures(dir: string): FixtureStore {
  const cached: Record<string, ByLang<Fixture>> = {};
  const generic: Partial<Record<RoomTypeValue, ByLang<Fixture>>> = {};

  for (const file of readdirSync(dir)) {
    const hashMatch = HASH_FILE.exec(file);
    const genericMatch = GENERIC_FILE.exec(file);
    if (!hashMatch && !genericMatch) continue;
    const lang = ((hashMatch ?? genericMatch)?.[2] ?? "es") as LanguageValue;
    if (!(LANGUAGES as readonly string[]).includes(lang)) continue;

    const parsed = FixtureSchema.safeParse(JSON.parse(readFileSync(join(dir, file), "utf8")));
    if (!parsed.success) {
      console.warn(`[fixtures] skipping invalid fixture ${file}`);
      continue;
    }
    if (hashMatch) {
      const hash = hashMatch[1] as string;
      cached[hash] = { ...cached[hash], [lang]: parsed.data };
    } else {
      const room = genericMatch?.[1] as string;
      if ((ROOM_TYPES as readonly string[]).includes(room)) {
        const key = room as RoomTypeValue;
        generic[key] = { ...generic[key], [lang]: parsed.data };
      }
    }
  }
  return createFixtureStore({ cached, generic });
}
