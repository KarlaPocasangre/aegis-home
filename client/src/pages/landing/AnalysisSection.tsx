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
import { useT } from "../../lib/i18n";
import { lastHousehold } from "../../lib/storage";
import { Band, SectionHeading } from "./layout";

/** A recorded real result, explorable before creating anything. */
function DemoResult() {
  const a = useT().analysis;
  const [activeId, setActiveId] = useState<string | null>(DEMO_HAZARDS[0]?.id ?? null);
  const select = (id: string) => setActiveId((current) => (current === id ? null : id));

  return (
    <div id="ejemplo" className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-3xl">{a.demoTitle}</h3>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-stone-300">
          {a.recorded}
        </span>
      </div>
      <p className="mt-1 text-base text-stone-400">{a.demoHint}</p>
      <div className="mt-4">
        <ImageCanvasOverlay
          src={DEMO_IMAGE}
          alt={a.demoAlt}
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
      <p className="mt-3 text-sm text-stone-400">{a.demoCaption}</p>
    </div>
  );
}

/** Consent, household creation and the one-tap sample analysis. */
function StartCard() {
  const a = useT().analysis;
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
      className="space-y-4 rounded-2xl bg-white/[0.04] p-4 shadow-lg ring-2 ring-white/10 sm:p-6"
    >
      <h3 className="font-display text-4xl">{a.startTitle}</h3>
      <PrivacyNotice accepted={accepted} onChange={setAccepted} />
      <div>
        <label htmlFor={nameId} className="block text-base font-semibold text-stone-100">
          {a.nameLabel}
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder={a.namePlaceholder}
          className="mt-1 block min-h-12 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-base"
        />
      </div>
      <button
        type="button"
        onClick={start}
        disabled={!accepted || busy !== null}
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-mint px-4 text-lg font-semibold text-ink transition hover:bg-mint-soft active:scale-[0.98] disabled:opacity-50"
      >
        {busy === "create" ? a.creating : <RollText>{a.start}</RollText>}
      </button>
      {busy === "sample" && <AnalysisProgress />}
      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-base text-red-200">
          {error}
        </p>
      )}
      <SampleImagePicker onPick={trySample} disabled={!accepted || busy !== null} />
      {!accepted && <p className="text-sm text-stone-400">{a.checkFirst}</p>}
    </div>
  );
}

export function AnalysisSection() {
  const a = useT().analysis;
  return (
    <Band id="analizar" labelledBy="analizar-title">
      <SectionHeading id="analizar-title" eyebrow={a.eyebrow} title={a.title} intro={a.intro} />
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
        <DemoResult />
        <StartCard />
      </div>
    </Band>
  );
}
