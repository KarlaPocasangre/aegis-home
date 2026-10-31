import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { HazardSchema, RegionSchema } from "../schemas/ai.js";
import { ROOM_TYPES, type RoomTypeValue } from "../schemas/enums.js";

// Fallback data (docs/AI_INTEGRATION.md §7):
//   <sha256>.json         recorded real response for a known normalized image → source "cached"
//   generic-<room>.json   sample result per room type, regions null              → source "mock"

export const FixtureSchema = z
  .object({
    roomType: z.enum(ROOM_TYPES),
    hazards: z.array(HazardSchema.extend({ region: RegionSchema.nullable() })).max(8),
  })
  .refine((f) => new Set(f.hazards.map((h) => h.id)).size === f.hazards.length, {
    message: "hazard ids must be unique",
  });

export type Fixture = z.infer<typeof FixtureSchema>;

export interface FixtureStore {
  byHash(sha256: string): Fixture | undefined;
  generic(roomType: RoomTypeValue): Fixture | undefined;
}

const HASH_FILE = /^([a-f0-9]{64})\.json$/;
const GENERIC_FILE = /^generic-([a-z_]+)\.json$/;

export function createFixtureStore(entries: {
  cached?: Record<string, Fixture>;
  generic?: Partial<Record<RoomTypeValue, Fixture>>;
}): FixtureStore {
  const cached = new Map(Object.entries(entries.cached ?? {}));
  const generic = entries.generic ?? {};
  return {
    byHash: (sha256) => cached.get(sha256),
    generic: (roomType) => generic[roomType] ?? generic.other,
  };
}

export function loadFixtures(dir: string): FixtureStore {
  const cached: Record<string, Fixture> = {};
  const generic: Partial<Record<RoomTypeValue, Fixture>> = {};

  for (const file of readdirSync(dir)) {
    const hash = HASH_FILE.exec(file)?.[1];
    const room = GENERIC_FILE.exec(file)?.[1];
    if (!hash && !room) continue;

    const parsed = FixtureSchema.safeParse(JSON.parse(readFileSync(join(dir, file), "utf8")));
    if (!parsed.success) {
      console.warn(`[fixtures] skipping invalid fixture ${file}`);
      continue;
    }
    if (hash) cached[hash] = parsed.data;
    else if ((ROOM_TYPES as readonly string[]).includes(room as string)) {
      generic[room as RoomTypeValue] = parsed.data;
    }
  }
  return createFixtureStore({ cached, generic });
}
