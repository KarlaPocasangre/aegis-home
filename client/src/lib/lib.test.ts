import { beforeEach, describe, expect, it } from "vitest";
import { contactLinks, helpMessage, normalizeName, normalizePhone } from "./contacts";
import { isValidRegion, placeMarkers, polygonPoints, regionAnchor } from "./regions";
import { householdPath, parseRoute, roomPath } from "./router";
import { ApiError } from "./api";
import { userMessage } from "./errors";
import { setLang } from "./i18n";
import { en } from "./i18n/en";
import { es } from "./i18n/es";
import { pt } from "./i18n/pt";
import { formatCost, roomLabel } from "./labels";
import { floorPercent, mostObstructing } from "./plan";
import type { Hazard } from "./types";

// The app picks its first language from the system (navigator.language): CI runs in English.
// Every test starts from Spanish so results don't depend on the machine or on test order.
beforeEach(() => setLang("es"));

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

  it("anchors markers at a box's corner or a polygon's topmost vertex", () => {
    expect(regionAnchor({ type: "bbox", points: [0.1, 0.2, 0.3, 0.4] })).toEqual({
      x: 0.1,
      y: 0.2,
    });
    expect(regionAnchor({ type: "polygon", points: [0.5, 0.4, 0.2, 0.9, 0.7, 0.6] })).toEqual({
      x: 0.5,
      y: 0.4,
    });
    expect(polygonPoints([0, 0.5, 1, 1])).toBe("0,0.5 1,1");
  });

  it("keeps markers inside the photo and apart", () => {
    const [a, b, c] = placeMarkers([
      { x: 0, y: 0.7 },
      { x: 0, y: 0.72 },
      { x: 1, y: 1 },
    ]);
    expect(a).toEqual({ x: 0.03, y: 0.7 });
    expect(b!.x - a!.x).toBeGreaterThanOrEqual(0.07);
    expect(c).toEqual({ x: 0.97, y: 0.97 });
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

describe("i18n", () => {
  // Same keys and list lengths in every language: a missing string would show up blank.
  function shape(value: unknown): unknown {
    if (typeof value === "function") return "fn";
    if (Array.isArray(value)) return value.map(shape);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, shape(v)]),
      );
    }
    return typeof value;
  }

  it("has the same structure in Spanish, Portuguese and English", () => {
    expect(shape(pt)).toEqual(shape(es));
    expect(shape(en)).toEqual(shape(es));
  });

  it("translates formatters, errors and the help message with the current language", () => {
    setLang("en");
    expect(formatCost(0)).toBe("No cost");
    expect(formatCost(8)).toBe("About $8.00");
    expect(userMessage(new ApiError(429, "RATE_LIMITED", "Demasiadas solicitudes"))).toBe(
      en.errors.codes.RATE_LIMITED,
    );
    expect(userMessage(new ApiError(0, "NETWORK", "x"))).toBe(en.errors.network);

    setLang("pt");
    expect(roomLabel("bathroom")).toBe("Banheiro");
    expect(helpMessage()).toBe(pt.contact.help);

    setLang("es");
    expect(formatCost(0)).toBe("Sin costo");
    expect(userMessage(new ApiError(500, "SOMETHING_NEW", "x"))).toBe(es.errors.generic);
  });
});

describe("floor share", () => {
  const hazard = (id: string, floorShare: unknown, status = "pending") =>
    ({ id, floorShare, status }) as unknown as Hazard;

  it("turns a 0–1 share into a whole percent and ignores bad values", () => {
    expect(floorPercent(hazard("a", 0.284))).toBe(28);
    expect(floorPercent(hazard("a", 0.001))).toBe(1);
    for (const bad of [null, undefined, 0, 1.5, Number.NaN, "0.3"]) {
      expect(floorPercent(hazard("a", bad))).toBeNull();
    }
  });

  it("picks the pending hazard that covers the most floor", () => {
    const hazards = [
      hazard("rug", 0.28),
      hazard("cables", 0.09),
      hazard("fixed", 0.6, "resolved"),
      hazard("lamp", null),
    ];
    expect(mostObstructing(hazards)).toEqual({ hazard: hazards[0], percent: 28 });
    expect(mostObstructing([hazard("lamp", null)])).toBeNull();
  });
});
