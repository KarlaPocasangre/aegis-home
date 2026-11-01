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
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="font-semibold">Compartir con la familia</p>
      <p className="mt-1 text-sm text-stone-600">
        Cualquier persona con este enlace puede ver y actualizar el plan de esta casa. Compártalo
        solo con personas de confianza.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={url}
          aria-label="Enlace del plan"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-900"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
