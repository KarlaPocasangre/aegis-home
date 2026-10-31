import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";

const FRONTEND_URL = "http://localhost:5173";
let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createApp({ FRONTEND_URL }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe("app", () => {
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
    const res = await fetch(`${baseUrl}/api/nope`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Recurso no encontrado" },
    });
  });

  it("rejects malformed JSON with 400 and oversized JSON with 413", async () => {
    const headers = { "Content-Type": "application/json" };
    const bad = await fetch(`${baseUrl}/api/nope`, { method: "POST", headers, body: "{" });
    expect(bad.status).toBe(400);
    const big = await fetch(`${baseUrl}/api/nope`, {
      method: "POST",
      headers,
      body: JSON.stringify({ x: "a".repeat(200_000) }),
    });
    expect(big.status).toBe(413);
  });
});

describe("loadConfig", () => {
  const base = { DATABASE_URL: "postgresql://localhost/db", FRONTEND_URL };

  it("accepts mock mode without Meta credentials", () => {
    const config = loadConfig({ ...base, MOCK_AI: "true" });
    expect(config.MOCK_AI).toBe(true);
    expect(config.HOUSEHOLD_TTL_DAYS).toBe(30);
  });

  it("requires Meta settings when not mocking, without echoing values", () => {
    expect(() => loadConfig({ ...base, MOCK_AI: "false", META_API_KEY: "secret-value" })).toThrow(
      /META_API_BASE_URL/,
    );
    try {
      loadConfig({ ...base, MOCK_AI: "false", META_API_KEY: "secret-value" });
    } catch (err) {
      expect(String(err)).not.toContain("secret-value");
    }
  });
});
