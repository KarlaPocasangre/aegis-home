import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Migrations need a direct connection: `migrate deploy` takes a session-level advisory lock, and
 * through Neon's pooler (PgBouncer) that lock can stay held on a pooled server connection, so the
 * next deploy times out waiting for it. Neon's direct host is the pooled one without "-pooler".
 * The app itself keeps using DATABASE_URL (pooled) at runtime.
 */
function directUrl(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.replace("-pooler.", ".");
    return parsed.toString();
  } catch {
    return url;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Empty fallback lets `prisma generate` run without a database (CI, fresh clones).
    url: directUrl(process.env.DATABASE_URL),
  },
});
