import { ApiError } from "./api";
import { t } from "./i18n";
import { ImagePrepError } from "./image";

/** Message safe to show the user, in the current language. Server errors map by their code. */
export function userMessage(error: unknown): string {
  const errors = t().errors;
  if (error instanceof ImagePrepError) return error.message;
  if (error instanceof ApiError) {
    if (error.code === "NETWORK") return errors.network;
    return errors.codes[error.code] ?? errors.generic;
  }
  return errors.generic;
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;
