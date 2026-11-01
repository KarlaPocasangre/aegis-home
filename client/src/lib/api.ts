import type {
  Assessment,
  CreatedHousehold,
  HazardStatus,
  HouseholdSummary,
  Room,
  RoomType,
} from "./types";
import { getLang } from "./i18n";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Analysis can take ~30 s, plus up to ~50 s if the free backend was asleep.
const UPLOAD_TIMEOUT_MS = 120_000;
const DEFAULT_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  json?: unknown;
  form?: FormData;
  timeoutMs?: number;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  // The token travels in a header, never in the API URL.
  if (opts.token) headers["X-Household-Token"] = opts.token;
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    body = opts.form;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body,
      signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK",
      "No se pudo conectar con el servicio. Revise su conexión e intente de nuevo.",
    );
  }

  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "Ocurrió un error inesperado",
    );
  }
  return data as T;
}

export const api = {
  createHousehold: (name?: string) =>
    request<CreatedHousehold>("/api/households", {
      method: "POST",
      json: name ? { name } : {},
    }),

  getHousehold: (token: string) => request<HouseholdSummary>("/api/households/me", { token }),

  deleteHousehold: (token: string) =>
    request<void>("/api/households/me", { method: "DELETE", token }),

  getAssessment: (token: string, id: string) =>
    request<Assessment>(`/api/assessments/${encodeURIComponent(id)}`, { token }),

  uploadRoom: (token: string, assessmentId: string, roomType: RoomType, image: Blob) => {
    const form = new FormData();
    form.set("roomType", roomType);
    // The model writes the hazard text in the language the app is showing.
    form.set("lang", getLang());
    form.set("image", image, "room.jpg");
    return request<Room>(`/api/assessments/${encodeURIComponent(assessmentId)}/rooms`, {
      method: "POST",
      token,
      form,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  },

  setHazardStatus: (token: string, hazardId: string, status: HazardStatus) =>
    request<{ id: string; status: HazardStatus; resolvedAt: string | null }>(
      `/api/hazards/${encodeURIComponent(hazardId)}`,
      { method: "PATCH", token, json: { status } },
    ),
};
