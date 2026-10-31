import { Router } from "express";

// Liveness probe for UptimeRobot: touches neither the DB nor the Meta API.
export const healthRouter = Router().get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
