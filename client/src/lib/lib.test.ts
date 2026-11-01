import { describe, expect, it } from "vitest";
import { contactLinks, helpMessage, normalizeName, normalizePhone } from "./contacts";
import { isValidRegion, polygonPoints, regionAnchor } from "./regions";
import { householdPath, parseRoute, roomPath } from "./router";

describe("normalizePhone", () => {
  it.each([
    ["+503 7000-0000", "+50370000000"],
    ["+1 (555) 123-4567", "+15551234567"],
  ])("accepts %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["70000000", "+503", "+503 7000 abcd", "+1234567890123456", "javascript:alert(1)"])(
    "rejects %s",
    (input) => {
      expect(normalizePhone(input)).toBeNull();
    },
  );
});

describe("contact links", () => {
  it("builds native links with the message URL-encoded", () => {
    const links = contactLinks("+503 7000 0000", helpMessage({ lat: 13.69, lng: -89.19 }));
    expect(links?.call).toBe("tel:+50370000000");
    expect(links?.whatsapp).toMatch(/^https:\/\/wa\.me\/50370000000\?text=Hola%2C/);
    expect(links?.sms).toContain("maps.google.com%2F%3Fq%3D13.69000%2C-89.19000");
  });

  it("refuses invalid numbers and ignores non-finite coordinates", () => {
    expect(contactLinks("12345", "hola")).toBeNull();
    expect(helpMessage({ lat: Number.NaN, lng: 1 })).not.toContain("maps");
  });

  it("bounds contact names", () => {
    expect(normalizeName("  Ana   María ")).toBe("Ana María");
    expect(normalizeName("")).toBeNull();
    expect(normalizeName("x".repeat(41))).toBeNull();
  });
});

describe("regions", () => {
  it("accepts normalized boxes and polygons", () => {
    expect(isValidRegion({ type: "bbox", points: [0.1, 0.2, 0.3, 0.4] })).toBe(true);
    expect(isValidRegion({ type: "polygon", points: [0, 0, 1, 0, 1, 1] })).toBe(true);
  });

  it.each([
    [{ type: "bbox" as const, points: [0.1, 0.2, 0.3] }],
    [{ type: "bbox" as const, points: [0.1, 0.2, 1.5, 0.4] }],
    [{ type: "polygon" as const, points: [0, 0, 1, 0, 1] }],
    [{ type: "bbox" as const, points: [0.1, Number.NaN, 0.3, 0.4] }],
    [null],
  ])("rejects %j", (region) => {
    expect(isValidRegion(region)).toBe(false);
  });

  it("anchors markers at the top-left corner", () => {
    expect(regionAnchor({ type: "polygon", points: [0.5, 0.4, 0.2, 0.9, 0.7, 0.6] })).toEqual({
      x: 0.2,
      y: 0.4,
    });
    expect(polygonPoints([0, 0.5, 1, 1])).toBe("0,0.5 1,1");
  });
});

describe("parseRoute", () => {
  const token = "3f0f7c3e-6d54-4a9a-8c35-2b9d9c3e1c11";
  const room = "a1b2c3d4-0000-4000-8000-000000000001";
  const hazard = "a1b2c3d4-0000-4000-8000-000000000002";

  it("opens the plan for bare household links (shared links keep working)", () => {
    expect(parseRoute(`/h/${token}`)).toEqual({ name: "household", token, view: "plan" });
    expect(parseRoute(`/h/${token}/`)).toEqual({ name: "household", token, view: "plan" });
  });

  it.each(["analizar", "espacios", "ajustes"] as const)("recognizes the %s view", (view) => {
    expect(parseRoute(`/h/${token}/${view}`)).toEqual({ name: "household", token, view });
  });

  it("reads a room and a valid preselected hazard", () => {
    expect(parseRoute(`/h/${token}/espacios/${room}`, `?riesgo=${hazard}`)).toEqual({
      name: "household",
      token,
      view: "espacios",
      roomId: room,
      hazardId: hazard,
    });
    expect(parseRoute(`/h/${token}/espacios/${room}`, "?riesgo=<script>")).toEqual({
      name: "household",
      token,
      view: "espacios",
      roomId: room,
    });
  });

  it.each([
    "/",
    "/h/not-a-token",
    "/h/",
    `/x/${token}`,
    `/h/${token}/otra`,
    `/h/${token}/ajustes/${room}`,
    `/h/${token}/espacios/not-a-uuid`,
  ])("falls back to landing for %s", (path) => {
    expect(parseRoute(path)).toEqual({ name: "landing" });
  });

  it("builds paths", () => {
    expect(householdPath(token)).toBe(`/h/${token}`);
    expect(householdPath(token, "ajustes")).toBe(`/h/${token}/ajustes`);
    expect(roomPath(token, room, hazard)).toBe(`/h/${token}/espacios/${room}?riesgo=${hazard}`);
  });
});
