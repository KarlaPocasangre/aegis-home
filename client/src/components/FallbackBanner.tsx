import type { AnalysisSource } from "../lib/types";

const DEFAULT_NOTICE = {
  cached:
    "El servicio de análisis no está disponible en este momento. Se muestra un análisis real hecho antes para esta misma foto.",
  mock: "Resultado de ejemplo: el servicio de análisis no está disponible en este momento.",
};

// Shown whenever a result did not come from a live model call (docs/ARCHITECTURE.md §8).
export function FallbackBanner({ source, notice }: { source: AnalysisSource; notice?: string }) {
  if (source === "live") return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
    >
      <p className="font-semibold">
        {source === "cached" ? "Resultado guardado previamente" : "Resultado de ejemplo"}
      </p>
      <p className="mt-1">{notice ?? DEFAULT_NOTICE[source]}</p>
    </div>
  );
}
