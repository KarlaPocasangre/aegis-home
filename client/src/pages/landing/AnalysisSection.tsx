import { useId, useState } from "react";
import { AnalysisProgress } from "../../components/AnalysisProgress";
import { HazardCard } from "../../components/HazardCard";
import { ImageCanvasOverlay } from "../../components/ImageCanvasOverlay";
import { RollText } from "../../components/RollText";
import { PrivacyNotice } from "../../components/PrivacyNotice";
import { SampleImagePicker } from "../../components/SampleImagePicker";
import { analyzeRoom } from "../../hooks/useAssessment";
import { api } from "../../lib/api";
import { DEMO_HAZARDS, DEMO_IMAGE } from "../../lib/demoResult";
import { userMessage } from "../../lib/errors";
import { householdPath, navigate } from "../../lib/router";
import { fetchSample, type SampleImage } from "../../lib/samples";
import { lastHousehold } from "../../lib/storage";
import { Band, SectionHeading } from "./layout";

/** A recorded real result, explorable before creating anything. */
function DemoResult() {
  const [activeId, setActiveId] = useState<string | null>(DEMO_HAZARDS[0]?.id ?? null);
  const select = (id: string) => setActiveId((current) => (current === id ? null : id));

  return (
    <div id="ejemplo" className="rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-3xl">Ejemplo: un baño</h3>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
          Resultado real grabado
        </span>
      </div>
      <p className="mt-1 text-base text-stone-600">Toque un número o un riesgo para resaltarlo.</p>
      <div className="mt-4">
        <ImageCanvasOverlay
          src={DEMO_IMAGE}
          alt="Ilustración de un baño con piso mojado"
          hazards={DEMO_HAZARDS}
          activeId={activeId}
          onSelect={select}
        />
      </div>
      <ol className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {DEMO_HAZARDS.map((hazard, index) => (
          <HazardCard
            key={hazard.id}
            hazard={hazard}
            number={index + 1}
            active={hazard.id === activeId}
            onSelect={select}
          />
        ))}
      </ol>
      <p className="mt-3 text-sm text-stone-600">
        Respuesta de Muse Spark y SAM 3.1 sobre una ilustración creada para esta demostración.
      </p>
    </div>
  );
}

/** Consent, household creation and the one-tap sample analysis. */
function StartCard() {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"create" | "sample" | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      navigate(householdPath(household.token, "analizar"));
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
    <div
      id="empezar"
      className="space-y-4 rounded-2xl bg-white p-4 shadow-lg ring-2 ring-teal-700/15 sm:p-6"
    >
      <h3 className="font-display text-4xl">Empezar una evaluación</h3>
      <PrivacyNotice accepted={accepted} onChange={setAccepted} />
      <div>
        <label htmlFor={nameId} className="block text-base font-semibold text-stone-800">
          Nombre para esta casa (opcional)
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Ej.: Casa de la abuela"
          className="mt-1 block min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 text-base"
        />
      </div>
      <button
        type="button"
        onClick={start}
        disabled={!accepted || busy !== null}
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-lg font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:opacity-50"
      >
        {busy === "create" ? "Creando…" : <RollText>Empezar evaluación</RollText>}
      </button>
      {busy === "sample" && <AnalysisProgress />}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">
          {error}
        </p>
      )}
      <SampleImagePicker onPick={trySample} disabled={!accepted || busy !== null} />
      {!accepted && (
        <p className="text-sm text-stone-600">Marque la casilla de arriba para continuar.</p>
      )}
    </div>
  );
}

export function AnalysisSection() {
  return (
    <Band id="analizar" labelledBy="analizar-title">
      <SectionHeading
        id="analizar-title"
        eyebrow="Análisis con IA"
        title="Pruébelo ahora"
        intro="Explore un resultado real o empiece con una foto de la casa. Si no tiene una a mano, use una imagen de prueba: el análisis se hace en vivo con la IA de Meta."
      />
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
        <DemoResult />
        <StartCard />
      </div>
    </Band>
  );
}
