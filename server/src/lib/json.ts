/**
 * Models sometimes wrap JSON in prose or code fences. Returns the outermost `{…}` parsed,
 * or `undefined` when there is none. Non-string input (already-parsed JSON) passes through.
 */
export function extractJsonObject(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return undefined;
  }
}
