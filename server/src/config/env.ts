import { z } from "zod";

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().min(1),
    FRONTEND_URL: z.url(),
    META_API_KEY: z.string().min(1).optional(),
    META_API_BASE_URL: z.url().optional(),
    META_MODEL_SPARK: z.string().min(1).optional(),
    META_MODEL_SAM: z.string().min(1).optional(),
    MOCK_AI: z.stringbool().default(false),
    AI_DAILY_CALL_CAP: z.coerce.number().int().min(0).default(200),
    HOUSEHOLD_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  })
  .superRefine((env, ctx) => {
    if (env.MOCK_AI) return;
    for (const key of [
      "META_API_KEY",
      "META_API_BASE_URL",
      "META_MODEL_SPARK",
      "META_MODEL_SAM",
    ] as const) {
      if (!env[key]) {
        ctx.addIssue({ code: "custom", path: [key], message: "required when MOCK_AI is false" });
      }
    }
  });

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): Config {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    // Only variable names are reported, never their values.
    const fields = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n  ${fields.join("\n  ")}`);
  }
  return result.data;
}
