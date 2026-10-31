import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { loadFixtures } from "./lib/fixtures.js";
import { createMetaClient } from "./lib/metaClient.js";
import { createPrisma } from "./lib/prisma.js";
import { createUsageService } from "./services/usageService.js";
import { createVisionService } from "./services/visionService.js";

const config = loadConfig();
const db = createPrisma(config.DATABASE_URL);
const vision = createVisionService({
  client: config.MOCK_AI ? null : createMetaClient(config),
  fixtures: loadFixtures(fileURLToPath(new URL("../fixtures", import.meta.url))),
  usage: createUsageService(db, config.AI_DAILY_CALL_CAP),
});
const app = createApp({ config, db, vision });

const server = app.listen(config.PORT, () => {
  console.log(
    `[server] listening on :${config.PORT} (${config.NODE_ENV}, mockAi=${config.MOCK_AI})`,
  );
});

function shutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => {
    void db.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
