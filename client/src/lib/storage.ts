// localStorage can be missing or throw (private mode, blocked site data): never let it break the app.

export function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not persisted; the app keeps working for this visit.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

const LAST_HOUSEHOLD_KEY = "aegis:lastHousehold";
const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isToken = (value: unknown): value is string =>
  typeof value === "string" && TOKEN_RE.test(value);

export const lastHousehold = {
  get: (): string | null => {
    const value = readJson(LAST_HOUSEHOLD_KEY);
    return isToken(value) ? value : null;
  },
  set: (token: string) => writeJson(LAST_HOUSEHOLD_KEY, token),
  clear: () => removeKey(LAST_HOUSEHOLD_KEY),
};
