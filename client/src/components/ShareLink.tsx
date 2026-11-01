import { useState } from "react";
import { householdPath } from "../lib/router";

export function ShareLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${householdPath(token)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie este enlace:", url);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="font-semibold">Compartir con la familia</p>
      <p className="mt-1 text-sm text-stone-400">
        Cualquier persona con este enlace puede ver y actualizar el plan de esta casa. Compártalo
        solo con personas de confianza.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={url}
          aria-label="Enlace del plan"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-stone-300"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
