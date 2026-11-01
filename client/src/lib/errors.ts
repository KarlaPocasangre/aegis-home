import { ApiError } from "./api";
import { ImagePrepError } from "./image";

/** Message safe to show the user. Server messages are already generic and in Spanish. */
export function userMessage(error: unknown): string {
  if (error instanceof ImagePrepError || error instanceof ApiError) return error.message;
  return "Ocurrió un error inesperado. Intente de nuevo.";
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;
