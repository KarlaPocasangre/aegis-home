import { useRef } from "react";
import { CountUp } from "../../components/CountUp";
import { ImageCanvasOverlay } from "../../components/ImageCanvasOverlay";
import { RollText } from "../../components/RollText";
import { DEMO_IMAGE, demoHazards } from "../../lib/demoResult";
import { capitalize, formatUsd } from "../../lib/labels";
import { gsap, MOTION_OK, useGSAP } from "../../lib/motion";
import { householdPath, linkHandler } from "../../lib/router";
import { scrollToHash } from "../../lib/scrollTo";
import { useLang, useT } from "../../lib/i18n";
import { lastHousehold } from "../../lib/storage";
import { DisplayHeading, ICONS, icon } from "./layout";

const scrollTo = (id: string) => () => scrollToHash(`#${id}`);

const primaryCta =
  "inline-flex min-h-14 items-center rounded-full bg-mint px-7 text-lg font-semibold text-ink shadow-[0_0_40px_-10px] shadow-mint/70 transition hover:bg-mint-soft active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint";

export function HeroSection() {
  const h = useT().hero;
  const lang = useLang();
  const hazards = demoHazards(lang);
  const topHazard = hazards[0];
  const demoCost = hazards.reduce((sum, hz) => sum + hz.costEstimateUsd, 0);
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
      className="relative overflow-hidden bg-ink px-4 pt-14 pb-20 sm:pt-20 sm:pb-28"
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-mint/10 blur-3xl"
      />
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-x-[-25%] bottom-0 h-[70%]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p
            data-hero-copy
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-sm font-semibold text-mint ring-1 ring-mint/30"
          >
            {icon(ICONS.sparkle, "size-4")}
            {h.badge}
          </p>
          <DisplayHeading as="h1" id="hero-title" className="mt-6 text-5xl text-white sm:text-7xl">
            {h.titleA} <em className="text-stone-400">{h.titleB}</em>
          </DisplayHeading>
          <p data-hero-copy className="mt-6 max-w-xl text-lg text-stone-300 sm:text-xl">
            {h.intro}
          </p>

          <div data-hero-copy className="mt-9 flex flex-wrap gap-3">
            {saved ? (
              <a
                href={householdPath(saved)}
                onClick={linkHandler(householdPath(saved))}
                className={primaryCta}
              >
                <RollText>{h.continue}</RollText>
              </a>
            ) : (
              <a href="#empezar" className={primaryCta}>
                <RollText>{h.analyze}</RollText>
              </a>
            )}
            <a
              href="#ejemplo"
              className="inline-flex min-h-14 items-center rounded-full bg-white/5 px-7 text-lg font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/10 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
            >
              <RollText>{h.seeExample}</RollText>
            </a>
          </div>

          <ul
            data-hero-copy
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-base text-stone-300"
          >
            {h.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-mint">{icon(ICONS.check, "size-5")}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative">
          <div
            data-hero-photo
            className="rounded-2xl bg-white/[0.04] p-3 shadow-2xl ring-1 ring-white/10"
          >
            <div className="relative overflow-hidden rounded-lg">
              <ImageCanvasOverlay
                src={DEMO_IMAGE}
                alt={h.photoAlt}
                hazards={hazards}
                activeId={topHazard?.id ?? null}
                onSelect={scrollTo("ejemplo")}
              />
              <div
                data-scan
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-mint/40 to-transparent opacity-0"
              />
            </div>
          </div>
          {topHazard && (
            <div
              data-hero-card="hazard"
              className="relative z-10 -mt-2 ml-4 max-w-[17rem] rounded-xl bg-white/[0.04] p-3 shadow-lg ring-1 ring-white/10 sm:-ml-6"
            >
              <p className="text-xs font-bold tracking-wide text-red-400 uppercase">{h.highRisk}</p>
              <p lang={lang} className="mt-0.5 font-semibold text-white">
                {capitalize(topHazard.labelEs)}
              </p>
              <p lang={lang} className="mt-0.5 text-sm text-stone-400">
                {topHazard.fixEs.split(".")[0]}.
              </p>
            </div>
          )}
          <div
            data-hero-card="plan"
            className="absolute -top-4 -right-2 rounded-xl bg-mint px-4 py-3 text-ink shadow-lg sm:-right-4"
          >
            <p className="text-xs font-semibold text-ink/70">{h.planOf}</p>
            <p className="text-lg font-bold">
              <CountUp to={hazards.length} delay={2.2} /> {h.fixes} ·{" "}
              <CountUp to={demoCost} format={formatUsd} delay={2.2} />
            </p>
          </div>
          <figcaption className="sr-only">{h.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
