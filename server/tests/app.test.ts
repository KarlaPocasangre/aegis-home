import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import { createFixtureStore } from "../src/lib/fixtures.js";
import { createVisionService } from "../src/services/visionService.js";
import { createTestDb, jpeg, listen, sparkHazard } from "./helpers.js";

const FRONTEND_URL = "http://localhost:5173";
const NO_LIMITS = {
  globalPer15Min: 10_000,
  createHouseholdPerHour: 10_000,
  analysisPerMinute: 10_000,
};
let server: Server;
let baseUrl: string;
let closeDb: () => Promise<void>;

beforeAll(async () => {
  const { db, close } = await createTestDb();
  closeDb = close;
  const vision = createVisionService({
    client: null,
    fixtures: createFixtureStore({
      generic: {
        bathroom: { roomType: "bathroom", hazards: [{ ...sparkHazard(), region: null } as never] },
      },
    }),
    usage: { tryConsume: async () => true },
  });
  const config = { FRONTEND_URL, HOUSEHOLD_TTL_DAYS: 30, NODE_ENV: "test" as const };
  server = createApp({ config, db, vision, rateLimits: NO_LIMITS }).listen(0);
  baseUrl = await listen(server);
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closeDb();
});

const api = (path: string, init: RequestInit = {}, token?: string) =>
  fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { "X-Household-Token": token } : {}),
      ...init.headers,
    },
  });

async function createHousehold() {
  const res = await api("/api/households", {
    method: "POST",
    body: JSON.stringify({ name: "Casa" }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as { token: string; assessmentId: string; expiresAt: string };
}

async function uploadRoom(token: string, assessmentId: string, file: Blob, roomType = "bathroom") {
  const form = new FormData();
  form.set("roomType", roomType);
  form.set("image", file, "room.jpg");
  return api(`/api/assessments/${assessmentId}/rooms`, { method: "POST", body: form }, token);
}

const jpegBlob = async () => new Blob([new Uint8Array(await jpeg())], { type: "image/jpeg" });

describe("platform", () => {
  it("GET /health returns ok without rate-limit headers", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(res.headers.get("ratelimit-policy")).toBeNull();
  });

  it("sets security headers and hides x-powered-by", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
    expect(res.headers.get("x-powered-by")).toBeNull();
  });

  it("allows CORS only for the frontend origin", async () => {
    const allowed = await fetch(`${baseUrl}/health`, { headers: { Origin: FRONTEND_URL } });
    expect(allowed.headers.get("access-control-allow-origin")).toBe(FRONTEND_URL);
    const other = await fetch(`${baseUrl}/health`, { headers: { Origin: "https://evil.example" } });
    expect(other.headers.get("access-control-allow-origin")).not.toBe("https://evil.example");
  });

  it("returns the generic error format for unknown routes", async () => {
    const res = await api("/api/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Recurso no encontrado" },
    });
  });

  it("rejects malformed JSON with 400 and oversized JSON with 413", async () => {
    const bad = await api("/api/households", { method: "POST", body: "{" });
    expect(bad.status).toBe(400);
    const big = await api("/api/households", {
      method: "POST",
      body: JSON.stringify({ name: "a".repeat(200_000) }),
    });
    expect(big.status).toBe(413);
  });
});

describe("households", () => {
  it("creates a household with a first assessment and reads it back", async () => {
    const { token, assessmentId, expiresAt } = await createHousehold();
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);

    const me = await api("/api/households/me", {}, token);
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({
      name: "Casa",
      assessments: [{ id: assessmentId, roomCount: 0 }],
    });
  });

  it("rejects invalid input with 422", async () => {
    const res = await api("/api/households", {
      method: "POST",
      body: JSON.stringify({ name: "x".repeat(81) }),
    });
    expect(res.status).toBe(422);
  });

  it.each([
    ["missing token", undefined],
    ["malformed token", "not-a-uuid"],
    ["unknown token", "3f0f7c3e-6d54-4a9a-8c35-2b9d9c3e1c11"],
  ])("returns 401 for a %s", async (_name, token) => {
    expect((await api("/api/households/me", {}, token)).status).toBe(401);
  });

  it("deletes everything for the token", async () => {
    const { token } = await createHousehold();
    expect((await api("/api/households/me", { method: "DELETE" }, token)).status).toBe(204);
    expect((await api("/api/households/me", {}, token)).status).toBe(401);
  });
});

describe("rooms, plan and hazards", () => {
  it("analyzes an upload, labels a non-live result and builds the plan", async () => {
    const { token, assessmentId } = await createHousehold();

    const res = await uploadRoom(token, assessmentId, await jpegBlob());
    expect(res.status).toBe(201);
    const room: any = await res.json();
    expect(room).toMatchObject({
      type: "bathroom",
      source: "mock",
      imageWidth: 1024,
      imageHeight: 768,
      notice: expect.stringContaining("Resultado de ejemplo"),
      hazards: [{ aiId: "h1", severity: "high", status: "pending", region: null }],
    });

    const assessment: any = await (await api(`/api/assessments/${assessmentId}`, {}, token)).json();
    expect(assessment.rooms).toHaveLength(1);
    expect(assessment.plan).toEqual({
      totalHazards: 1,
      resolved: 0,
      pendingCostUsd: 8,
      orderedHazardIds: [room.hazards[0].id],
    });
  });

  it("resolves and undoes a hazard", async () => {
    const { token, assessmentId } = await createHousehold();
    const room: any = await (await uploadRoom(token, assessmentId, await jpegBlob())).json();
    const hazardId = room.hazards[0].id;

    const resolved = await api(
      `/api/hazards/${hazardId}`,
      { method: "PATCH", body: JSON.stringify({ status: "resolved" }) },
      token,
    );
    expect(await resolved.json()).toMatchObject({
      status: "resolved",
      resolvedAt: expect.any(String),
    });

    const undone = await api(
      `/api/hazards/${hazardId}`,
      { method: "PATCH", body: JSON.stringify({ status: "pending" }) },
      token,
    );
    expect(await undone.json()).toMatchObject({ status: "pending", resolvedAt: null });
  });

  it("hides other households' resources behind 404", async () => {
    const owner = await createHousehold();
    const intruder = await createHousehold();
    const room: any = await (
      await uploadRoom(owner.token, owner.assessmentId, await jpegBlob())
    ).json();

    expect((await api(`/api/assessments/${owner.assessmentId}`, {}, intruder.token)).status).toBe(
      404,
    );
    expect((await uploadRoom(intruder.token, owner.assessmentId, await jpegBlob())).status).toBe(
      404,
    );
    const patch = await api(
      `/api/hazards/${room.hazards[0].id}`,
      { method: "PATCH", body: JSON.stringify({ status: "resolved" }) },
      intruder.token,
    );
    expect(patch.status).toBe(404);
    expect((await api("/api/assessments/not-a-uuid", {}, owner.token)).status).toBe(404);
  });

  it("rejects bad uploads", async () => {
    const { token, assessmentId } = await createHousehold();

    const disguised = new Blob([new TextEncoder().encode("%PDF-1.7 not an image")], {
      type: "image/jpeg",
    });
    expect((await uploadRoom(token, assessmentId, disguised)).status).toBe(415);

    const huge = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/jpeg" });
    expect((await uploadRoom(token, assessmentId, huge)).status).toBe(413);

    expect((await uploadRoom(token, assessmentId, await jpegBlob(), "garage")).status).toBe(422);
  });

  it("creates an additional assessment", async () => {
    const { token } = await createHousehold();
    const res = await api("/api/assessments", { method: "POST" }, token);
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: expect.any(String) });
  });
});

describe("loadConfig", () => {
  const base = { DATABASE_URL: "postgresql://localhost/db", FRONTEND_URL };

  it("accepts mock mode without Meta credentials", () => {
    const config = loadConfig({ ...base, MOCK_AI: "true" });
    expect(config.MOCK_AI).toBe(true);
    expect(config.HOUSEHOLD_TTL_DAYS).toBe(30);
  });

  it("normalizes FRONTEND_URL to a bare origin", () => {
    const config = loadConfig({ ...base, MOCK_AI: "true", FRONTEND_URL: "https://app.example/" });
    expect(config.FRONTEND_URL).toBe("https://app.example");
  });

  it("treats empty variables as unset", () => {
    expect(() =>
      loadConfig({ ...base, MOCK_AI: "true", META_API_KEY: "", PORT: "" }),
    ).not.toThrow();
  });

  it("requires Meta settings when not mocking, without echoing values", () => {
    const env = { ...base, MOCK_AI: "false", META_API_KEY: "secret-value" };
    expect(() => loadConfig(env)).toThrow(/META_API_BASE_URL/);
    expect(() => loadConfig(env)).not.toThrow(/secret-value/);
  });
});

describe("rate limits", () => {
  it("returns 429 with the error format once a limit is hit", async () => {
    const { db, close } = await createTestDb();
    const vision = createVisionService({
      client: null,
      fixtures: createFixtureStore({}),
      usage: { tryConsume: async () => true },
    });
    const config = { FRONTEND_URL, HOUSEHOLD_TTL_DAYS: 30, NODE_ENV: "test" as const };
    const limited = createApp({
      config,
      db,
      vision,
      rateLimits: { createHouseholdPerHour: 1 },
    }).listen(0);
    const url = await listen(limited);
    try {
      const post = () => fetch(`${url}/api/households`, { method: "POST" });
      expect((await post()).status).toBe(201);
      const blocked = await post();
      expect(blocked.status).toBe(429);
      expect(await blocked.json()).toMatchObject({ error: { code: "RATE_LIMITED" } });
      expect((await fetch(`${url}/health`)).status).toBe(200);
    } finally {
      await new Promise((resolve) => limited.close(resolve));
      await close();
    }
  });
});
