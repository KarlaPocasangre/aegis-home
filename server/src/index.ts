import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.PORT, () => {
  console.log(
    `[server] listening on :${config.PORT} (${config.NODE_ENV}, mockAi=${config.MOCK_AI})`,
  );
});

function shutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
