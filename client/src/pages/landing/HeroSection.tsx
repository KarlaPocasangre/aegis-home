import { useRef } from "react";
import { CountUp } from "../../components/CountUp";
import { ImageCanvasOverlay } from "../../components/ImageCanvasOverlay";
import { RollText } from "../../components/RollText";
import { DEMO_HAZARDS, DEMO_IMAGE } from "../../lib/demoResult";
import { capitalize, formatUsd } from "../../lib/labels";
import { gsap, MOTION_OK, useGSAP } from "../../lib/motion";
import { householdPath, linkHandler } from "../../lib/router";
import { lastHousehold } from "../../lib/storage";
import { DisplayHeading, ICONS, icon } from "./layout";

const TRUST = ["Gratis y sin crear cuenta", "Las fotos no se guardan", "Pensado en español"];

const topHazard = DEMO_HAZARDS[0];
const demoCost = DEMO_HAZARDS.reduce((sum, h) => sum + h.costEstimateUsd, 0);

const scrollTo = (id: string) => () => document.getElementById(id)?.scrollIntoView();

const primaryCta =
  "inline-flex min-h-14 items-center rounded-xl bg-teal-700 px-6 text-lg font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

export function HeroSection() {
  const saved = lastHousehold.get();
  const root = useRef<HTMLElement>(null);

  // The photo "gets analyzed" on load: a scan line sweeps, then each hazard box and marker
  // appears in priority order and the plan card slides in. Content is static without motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-hero-copy]", { y: 28, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.35)
          .from("[data-hero-photo]", { y: 40, opacity: 0, scale: 0.96, duration: 1 }, 0.2)
          .fromTo(
            "[data-scan]",
            { yPercent: -100, opacity: 1 },
            { yPercent: 100, duration: 1.3, ease: "power1.inOut" },
            0.9,
          )
          .to("[data-scan]", { opacity: 0, duration: 0.3 }, ">-0.2")
          .from(
            "[data-hero-photo] svg rect",
            {
              scale: 0,
              transformOrigin: "50% 50%",
              opacity: 0,
              duration: 0.6,
              ease: "back.out(1.6)",
              stagger: 0.18,
            },
            1.5,
          )
          .from(
            "[data-hero-photo] button",
            { scale: 0, duration: 0.45, ease: "back.out(2.5)", stagger: 0.18 },
            1.65,
          )
          .from("[data-hero-card='plan']", { x: 30, opacity: 0, duration: 0.7 }, 2.2)
          .from("[data-hero-card='hazard']", { y: 24, opacity: 0, duration: 0.7 }, 2.4);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white px-4 pt-14 pb-20 sm:pt-20 sm:pb-28"
    >
      <div
        aria-hidden
        className="absolute -top-32 -right-32 size-[32rem] rounded-full bg-teal-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-1/2 -left-40 size-80 rounded-full bg-amber-100/50 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p
            data-hero-copy
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-teal-800 ring-1 ring-teal-200"
          >
            {icon(ICONS.sparkle, "size-4")}
            Con Muse Spark y SAM 3.1 de Meta
          </p>
          <DisplayHeading
            as="h1"
            id="hero-title"
            className="mt-6 text-5xl text-stone-900 sm:text-7xl"
          >
            Una casa más segura para <em className="text-teal-800">quienes más queremos</em>
          </DisplayHeading>
          <p data-hero-copy className="mt-6 max-w-xl text-lg text-stone-700 sm:text-xl">
            Tome fotos de la casa de su mamá, papá o abuelos. La inteligencia artificial señala lo
            que puede provocar una caída y le da un plan de arreglos sencillos, en orden y con costo
            aproximado.
          </p>

          <div data-hero-copy className="mt-9 flex flex-wrap gap-3">
            {saved ? (
              <a
                href={householdPath(saved)}
                onClick={linkHandler(householdPath(saved))}
                className={primaryCta}
              >
                <RollText>Continuar mi evaluación</RollText>
              </a>
            ) : (
              <a href="#empezar" className={primaryCta}>
                <RollText>Analizar mi casa</RollText>
              </a>
            )}
            <a
              href="#ejemplo"
              className="inline-flex min-h-14 items-center rounded-xl bg-white px-6 text-lg font-semibold text-teal-900 ring-2 ring-teal-700/20 transition hover:ring-teal-700/50 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <RollText>Ver un ejemplo real</RollText>
            </a>
          </div>

          <ul
            data-hero-copy
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-base text-stone-700"
          >
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-teal-700">{icon(ICONS.check, "size-5")}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative">
          <div
            data-hero-photo
            className="rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-stone-200"
          >
            <div className="relative overflow-hidden rounded-lg">
              <ImageCanvasOverlay
                src={DEMO_IMAGE}
                alt="Ilustración de un baño con piso mojado y riesgos resaltados"
                hazards={DEMO_HAZARDS}
                activeId={topHazard?.id ?? null}
                onSelect={scrollTo("ejemplo")}
              />
              <div
                data-scan
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-teal-300/40 to-transparent opacity-0"
              />
            </div>
          </div>
          {topHazard && (
            <div
              data-hero-card="hazard"
              className="relative z-10 -mt-2 ml-4 max-w-[17rem] rounded-xl bg-white p-3 shadow-lg ring-1 ring-stone-200 sm:-ml-6"
            >
              <p className="text-xs font-bold tracking-wide text-red-700 uppercase">Riesgo alto</p>
              <p className="mt-0.5 font-semibold text-stone-900">{capitalize(topHazard.labelEs)}</p>
              <p className="mt-0.5 text-sm text-stone-600">{topHazard.fixEs.split(".")[0]}.</p>
            </div>
          )}
          <div
            data-hero-card="plan"
            className="absolute -top-4 -right-2 rounded-xl bg-teal-800 px-4 py-3 text-white shadow-lg sm:-right-4"
          >
            <p className="text-xs font-semibold text-teal-100">Plan de este baño</p>
            <p className="text-lg font-bold">
              <CountUp to={DEMO_HAZARDS.length} delay={2.2} /> arreglos ·{" "}
              <CountUp to={demoCost} format={formatUsd} delay={2.2} />
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
