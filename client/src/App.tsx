import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiStatus = "checking" | "ok" | "down";

const STATUS_TEXT: Record<ApiStatus, string> = {
  checking: "Conectando con el servicio…",
  ok: "Servicio disponible",
  down: "El servicio no responde (puede tardar hasta un minuto en despertar)",
};

// Placeholder for the first deploy; replaced by the real flow in the frontend phase.
export default function App() {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/health`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(60_000)]),
    })
      .then((res) => setStatus(res.ok ? "ok" : "down"))
      .catch(() => {
        if (!controller.signal.aborted) setStatus("down");
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-dvh bg-stone-50 px-4 py-12 text-stone-900">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-teal-800">aegis-home</h1>
        <p className="mt-3 text-lg">
          Fotos de la casa de un adulto mayor convertidas en un plan para prevenir caídas.
        </p>
        <p className="mt-8 flex items-center gap-2 text-sm text-stone-600" role="status">
          <span
            aria-hidden
            className={`inline-block size-2.5 rounded-full ${
              status === "ok" ? "bg-emerald-500" : status === "down" ? "bg-red-500" : "bg-amber-400"
            }`}
          />
          {STATUS_TEXT[status]}
        </p>
      </div>
    </main>
  );
}
