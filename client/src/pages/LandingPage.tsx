import { useId, useState } from "react";
import { PrivacyNotice } from "../components/PrivacyNotice";
import { SampleImagePicker } from "../components/SampleImagePicker";
import { AnalysisProgress } from "../components/AnalysisProgress";
import { analyzeRoom } from "../hooks/useAssessment";
import { api } from "../lib/api";
import { userMessage } from "../lib/errors";
import { householdPath, navigate } from "../lib/router";
import { fetchSample, type SampleImage } from "../lib/samples";
import { lastHousehold } from "../lib/storage";

const STEPS = [
  { title: "Tome fotos", text: "Del baño, la cocina, las escaleras y los pasillos de la casa." },
  {
    title: "Vea los riesgos",
    text: "La IA de Meta señala en la foto lo que puede provocar una caída.",
  },
  {
    title: "Siga el plan",
    text: "Arreglos sencillos, ordenados por prioridad y con costo aproximado.",
  },
];

export function LandingPage() {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"create" | "sample" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saved = lastHousehold.get();
  const nameId = useId();

  const createHousehold = async () => {
    const household = await api.createHousehold(name.trim() || undefined);
    lastHousehold.set(household.token);
    return household;
  };

  const start = async () => {
    setBusy("create");
    setError(null);
    try {
      const household = await createHousehold();
      navigate(householdPath(household.token));
    } catch (err) {
      setError(userMessage(err));
      setBusy(null);
    }
  };

  // One tap from the landing page to a full result: create the household and analyze a sample.
  const trySample = async (sample: SampleImage) => {
    setBusy("sample");
    setError(null);
    try {
      const household = await createHousehold();
      try {
        const image = await fetchSample(sample);
        await analyzeRoom(
          household.token,
          household.assessmentId,
          image,
          sample.roomType,
          sample.url,
        );
      } finally {
        navigate(householdPath(household.token));
      }
    } catch (err) {
      setError(userMessage(err));
      setBusy(null);
    }
  };

  return (
    <div className="space-y-10">
      <section className="pt-4">
        <h1 className="text-3xl leading-tight font-bold text-stone-900 sm:text-4xl">
          Una casa más segura para quienes más queremos
        </h1>
        <p className="mt-4 text-lg text-stone-700">
          Tome fotos de la casa de su mamá, papá o abuelos y reciba un plan claro para prevenir
          caídas, con arreglos sencillos y económicos.
        </p>
      </section>

      {saved && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <p className="text-teal-950">Tiene una evaluación guardada en este dispositivo.</p>
          <button
            type="button"
            onClick={() => navigate(householdPath(saved))}
            className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
          >
            Continuar
          </button>
        </div>
      )}

      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
            <span className="flex size-8 items-center justify-center rounded-full bg-teal-700 font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-3 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm text-stone-600">{step.text}</p>
          </li>
        ))}
      </ol>

      <section className="space-y-4 rounded-xl bg-stone-100 p-4 sm:p-6">
        <h2 className="text-xl font-bold">Empezar una evaluación</h2>
        <PrivacyNotice accepted={accepted} onChange={setAccepted} />
        <div>
          <label htmlFor={nameId} className="block text-sm font-semibold text-stone-700">
            Nombre para esta casa (opcional)
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Ej.: Casa de la abuela"
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"
          />
        </div>
        <button
          type="button"
          onClick={start}
          disabled={!accepted || busy !== null}
          className="w-full rounded-lg bg-teal-700 px-4 py-3 text-lg font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {busy === "create" ? "Creando…" : "Empezar evaluación"}
        </button>
        {busy === "sample" && <AnalysisProgress />}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <SampleImagePicker onPick={trySample} disabled={!accepted || busy !== null} />
        {!accepted && (
          <p className="text-xs text-stone-500">Marque la casilla de arriba para continuar.</p>
        )}
      </section>
    </div>
  );
}
