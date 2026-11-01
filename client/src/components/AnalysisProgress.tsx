import { useEffect, useState } from "react";

export function AnalysisProgress() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg bg-teal-50 px-4 py-3 text-teal-950 dark:bg-mint/10 dark:text-mint-soft"
    >
      <span
        aria-hidden
        className="mt-1 inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-teal-700 border-t-transparent dark:border-mint dark:border-t-transparent"
      />
      <div className="text-sm">
        <p className="font-semibold">Analizando la foto… {seconds} s</p>
        <p className="mt-0.5">
          {seconds < 20
            ? "Buscando riesgos de caída en el espacio."
            : "Puede tardar hasta un minuto si el servicio estaba en reposo."}
        </p>
      </div>
    </div>
  );
}
