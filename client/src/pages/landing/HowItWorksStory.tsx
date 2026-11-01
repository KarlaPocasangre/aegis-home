import { useEffect, useRef, useState } from "react";
import { ImageCanvasOverlay } from "../../components/ImageCanvasOverlay";
import { DEMO_IMAGE, demoHazards } from "../../lib/demoResult";
import { capitalize, formatUsd, SEVERITY_STYLES } from "../../lib/labels";
import { useLang, useT } from "../../lib/i18n";
import { Band, ICONS, SectionHeading, icon } from "./layout";

const STEP_ICONS = [ICONS.camera, ICONS.sparkle, ICONS.target, ICONS.list];

const fade = (on: boolean) =>
  `transition-all duration-500 ease-out motion-reduce:transition-none ${on ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}`;

/** The same photo at each stage of the pipeline. Decorative: the step text carries the meaning. */
function StoryVisual({ stage }: { stage: number }) {
  const tr = useT();
  const hazards = demoHazards(useLang());
  const demoCost = hazards.reduce((sum, h) => sum + h.costEstimateUsd, 0);
  return (
    <div
      inert
      aria-hidden
      className="relative mx-auto w-full max-w-md rounded-[2rem] bg-black p-3 shadow-(--shadow-float) ring-1 ring-white/10"
    >
      <div className="relative overflow-hidden rounded-[1.4rem] bg-ink-2">
        <div className={stage >= 2 ? "" : "[&_svg]:opacity-0 [&_button]:opacity-0"}>
          <ImageCanvasOverlay
            src={DEMO_IMAGE}
            alt=""
            hazards={hazards}
            activeId={null}
            onSelect={() => {}}
          />
        </div>

        {/* Stage 0: camera framing */}
        <div className={`absolute inset-4 ${fade(stage === 0)}`}>
          {[
            "top-0 left-0 border-t-4 border-l-4",
            "top-0 right-0 border-t-4 border-r-4",
            "bottom-0 left-0 border-b-4 border-l-4",
            "bottom-0 right-0 border-b-4 border-r-4",
          ].map((c) => (
            <span key={c} className={`absolute size-8 rounded-sm border-white/90 ${c}`} />
          ))}
        </div>

        {/* Stage 1: what Spark found, as labels */}
        <ul className={`absolute inset-x-3 bottom-3 flex flex-wrap gap-2 ${fade(stage === 1)}`}>
          {hazards.map((h, i) => (
            <li
              key={h.id}
              style={{ transitionDelay: stage === 1 ? `${i * 90}ms` : "0ms" }}
              className="rounded-full bg-ink/85 px-3 py-1 text-sm font-semibold text-white shadow ring-1 ring-white/15 backdrop-blur"
            >
              <span
                className={`mr-1.5 inline-block size-2 rounded-full ${SEVERITY_STYLES[h.severity].marker}`}
              />
              {capitalize(h.labelEs)}
            </li>
          ))}
        </ul>

        {/* Stage 3: the plan */}
        <div
          className={`absolute inset-x-3 bottom-3 rounded-2xl bg-ink/90 p-4 shadow-(--shadow-float) ring-1 ring-white/10 backdrop-blur ${fade(stage === 3)}`}
        >
          <div className="flex items-baseline justify-between">
            <p className="font-semibold text-white">{tr.how.planTitle}</p>
            <p className="text-sm text-stone-400">{formatUsd(demoCost)}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/4 rounded-full bg-emerald-500" />
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {hazards.slice(0, 3).map((h, i) => (
              <li key={h.id} className="flex items-center gap-2 text-stone-100">
                <span
                  className={`flex size-4 items-center justify-center rounded border ${i === 0 ? "border-emerald-600 bg-emerald-600 text-snow" : "border-stone-400"}`}
                >
                  {i === 0 && icon(ICONS.check, "size-3")}
                </span>
                <span className={i === 0 ? "text-stone-500 line-through" : ""}>
                  {capitalize(h.labelEs)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop: the phone stays pinned while the steps scroll past; the step crossing the middle of
 * the screen drives the phone's stage. Phones: each step shows its own stage, no pinning.
 */
export function HowItWorksStory() {
  const how = useT().how;
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Band id="como-funciona" tone="stone" labelledBy="como-funciona-title">
      <SectionHeading
        id="como-funciona-title"
        eyebrow={how.eyebrow}
        title={how.title}
        intro={how.intro}
      />

      <div className="mt-14 lg:grid lg:grid-cols-2 lg:gap-16">
        <div className="sticky top-[max(7rem,calc(50vh-12rem))] hidden h-fit lg:block">
          <StoryVisual stage={active} />
        </div>

        <ol>
          {how.steps.map((step, index) => (
            <li
              key={step.title}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-step={index}
              className="flex flex-col justify-center py-10 lg:min-h-[50vh] lg:py-0"
            >
              <div
                className={`transition-opacity duration-500 motion-reduce:transition-none ${active === index ? "lg:opacity-100" : "lg:opacity-35"}`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-mint text-ink">
                    {icon(STEP_ICONS[index])}
                  </span>
                  <span className="font-display text-5xl text-white/15" aria-hidden>
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-4xl text-white">{step.title}</h3>
                <p className="mt-3 max-w-md text-lg text-stone-300">{step.text}</p>
              </div>
              <div className="mt-8 lg:hidden">
                <StoryVisual stage={index} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  );
}
