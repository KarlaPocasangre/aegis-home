import { useT } from "../lib/i18n";
import type { AnalysisSource } from "../lib/types";

// Shown whenever a result did not come from a live model call (docs/ARCHITECTURE.md §8).
// The server's notice is Spanish-only, so the text is chosen locally from the source.
export function FallbackBanner({ source }: { source: AnalysisSource }) {
  const f = useT().fallback;
  if (source === "live") return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
    >
      <p className="font-semibold">{source === "cached" ? f.cachedTitle : f.mockTitle}</p>
      <p className="mt-1">{source === "cached" ? f.cachedNotice : f.mockNotice}</p>
    </div>
  );
}
