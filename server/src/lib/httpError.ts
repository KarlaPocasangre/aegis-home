export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "AI_PROVIDER_ERROR"
  | "INTERNAL_ERROR";

// User-facing messages are generic and in Spanish (docs/API_SPECS.md §1).
const DEFAULTS: Record<ErrorCode, { status: number; message: string }> = {
  BAD_REQUEST: { status: 400, message: "Solicitud mal formada" },
  UNAUTHORIZED: { status: 401, message: "Acceso no autorizado" },
  NOT_FOUND: { status: 404, message: "Recurso no encontrado" },
  PAYLOAD_TOO_LARGE: { status: 413, message: "El archivo es demasiado grande" },
  UNSUPPORTED_MEDIA_TYPE: { status: 415, message: "Tipo de archivo no soportado" },
  VALIDATION_ERROR: { status: 422, message: "Datos de entrada no válidos" },
  RATE_LIMITED: { status: 429, message: "Demasiadas solicitudes, intente más tarde" },
  AI_PROVIDER_ERROR: { status: 502, message: "El servicio de análisis no está disponible" },
  INTERNAL_ERROR: { status: 500, message: "Error interno" },
};

export class HttpError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message?: string,
  ) {
    const defaults = DEFAULTS[code];
    super(message ?? defaults.message);
    this.name = "HttpError";
    this.status = defaults.status;
  }

  toBody() {
    return { error: { code: this.code, message: this.message } };
  }
}
