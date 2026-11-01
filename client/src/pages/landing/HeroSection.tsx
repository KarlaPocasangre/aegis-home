import { ImageCanvasOverlay } from "../../components/ImageCanvasOverlay";
import { DEMO_HAZARDS, DEMO_IMAGE } from "../../lib/demoResult";
import { capitalize, formatUsd } from "../../lib/labels";
import { householdPath, linkHandler } from "../../lib/router";
import { lastHousehold } from "../../lib/storage";
import { ICONS, icon } from "./layout";

const TRUST = ["Gratis y sin crear cuenta", "Las fotos no se guardan", "Pensado en español"];

const topHazard = DEMO_HAZARDS[0];
const demoCost = DEMO_HAZARDS.reduce((sum, h) => sum + h.costEstimateUsd, 0);

const scrollTo = (id: string) => () => document.getElementById(id)?.scrollIntoView();

export function HeroSection() {
  const saved = lastHousehold.get();

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white px-4 pt-12 pb-16 sm:pt-16 sm:pb-24"
    >
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-96 rounded-full bg-teal-200/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-teal-800 ring-1 ring-teal-200">
            {icon(ICONS.sparkle, "size-4")}
            Con Muse Spark y SAM 3.1 de Meta
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl leading-tight font-bold tracking-tight text-stone-900 sm:text-5xl"
          >
            Una casa más segura para quienes más queremos
          </h1>
          <p className="mt-5 text-lg text-stone-700 sm:text-xl">
            Tome fotos de la casa de su mamá, papá o abuelos. La inteligencia artificial señala lo
            que puede provocar una caída y le da un plan de arreglos sencillos, en orden y con costo
            aproximado.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {saved ? (
              <a
                href={householdPath(saved)}
                onClick={linkHandler(householdPath(saved))}
                className="inline-flex min-h-14 items-center rounded-xl bg-teal-700 px-6 text-lg font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Continuar mi evaluación
              </a>
            ) : (
              <a
                href="#empezar"
                className="inline-flex min-h-14 items-center rounded-xl bg-teal-700 px-6 text-lg font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Analizar mi casa
              </a>
            )}
            <a
              href="#ejemplo"
              className="inline-flex min-h-14 items-center rounded-xl bg-white px-6 text-lg font-semibold text-teal-900 ring-2 ring-teal-700/20 hover:ring-teal-700/50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Ver un ejemplo real
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base text-stone-700">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-teal-700">{icon(ICONS.check, "size-5")}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative">
          <div className="rounded-2xl bg-white p-3 shadow-xl ring-1 ring-stone-200">
            <ImageCanvasOverlay
              src={DEMO_IMAGE}
              alt="Ilustración de un baño con piso mojado y riesgos resaltados"
              hazards={DEMO_HAZARDS}
              activeId={topHazard?.id ?? null}
              onSelect={scrollTo("ejemplo")}
            />
          </div>
          {topHazard && (
            <div className="relative z-10 -mt-2 ml-4 max-w-[17rem] rounded-xl bg-white p-3 shadow-lg ring-1 ring-stone-200 sm:-ml-6">
              <p className="text-xs font-bold tracking-wide text-red-700 uppercase">Riesgo alto</p>
              <p className="mt-0.5 font-semibold text-stone-900">{capitalize(topHazard.labelEs)}</p>
              <p className="mt-0.5 text-sm text-stone-600">{topHazard.fixEs.split(".")[0]}.</p>
            </div>
          )}
          <div className="absolute -top-4 -right-2 rounded-xl bg-teal-800 px-4 py-3 text-white shadow-lg sm:-right-4">
            <p className="text-xs font-semibold text-teal-100">Plan de este baño</p>
            <p className="text-lg font-bold">
              {DEMO_HAZARDS.length} arreglos · {formatUsd(demoCost)}
            </p>
          </div>
          <figcaption className="sr-only">
            Resultado real de Muse Spark y SAM 3.1 sobre una ilustración de ejemplo.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
