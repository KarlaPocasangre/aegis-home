import { readdirSync, readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client.js";
import type { NormalizedImage } from "../src/lib/imagePipeline.js";

const migrationsDir = fileURLToPath(new URL("../prisma/migrations", import.meta.url));

/** In-memory Postgres with the real migrations applied. */
export async function createTestDb() {
  const pg = new PGlite();
  for (const dir of readdirSync(migrationsDir)
    .filter((d) => !d.endsWith(".toml"))
    .sort()) {
    await pg.exec(readFileSync(`${migrationsDir}/${dir}/migration.sql`, "utf8"));
  }
  const db = new PrismaClient({ adapter: new PrismaPGlite(pg) });
  return {
    db,
    close: async () => {
      await db.$disconnect();
      await pg.close();
    },
  };
}

export async function listen(server: Server): Promise<string> {
  await new Promise((resolve) => server.once("listening", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

export function jpeg(width = 1600, height = 1200): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: "#8899aa" } })
    .jpeg()
    .toBuffer();
}

export const fakeImage = (overrides: Partial<NormalizedImage> = {}): NormalizedImage => ({
  buffer: Buffer.alloc(0),
  mime: "image/jpeg",
  width: 1000,
  height: 500,
  sha256: "0".repeat(64),
  ...overrides,
});

export const sparkHazard = (overrides: Record<string, unknown> = {}) => ({
  id: "h1",
  label_en: "loose rug",
  label_es: "alfombra suelta",
  severity: "high",
  description_es: "La alfombra no tiene base antideslizante junto a la ducha.",
  fix_es: "Retírela o fíjela con cinta antideslizante por debajo.",
  cost_estimate_usd: 8,
  materials_es: ["cinta antideslizante"],
  confidence: 0.8,
  ...overrides,
});
