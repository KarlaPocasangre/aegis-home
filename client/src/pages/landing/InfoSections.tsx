import { RollText } from "../../components/RollText";
import { ScrollFillText } from "../../components/ScrollFillText";
import { useT } from "../../lib/i18n";
import { Band, DisplayHeading, ICONS, SectionHeading, icon } from "./layout";

export function ProblemSection() {
  const p = useT().problem;
  return (
    <Band id="por-que" labelledBy="por-que-title">
      <h2 className="text-sm font-bold tracking-widest text-mint uppercase" id="por-que-title">
        {p.eyebrow}
      </h2>
      <ScrollFillText
        text={p.story}
        className="mt-6 font-display text-4xl leading-[1.15] text-white sm:text-6xl"
      />
      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div>
          <p className="text-lg text-stone-300">
            {p.statLead}{" "}
            <span className="block font-display text-8xl leading-none text-mint">
              {p.statValue}
            </span>
            <span className="mt-2 block text-xl font-semibold text-white">{p.statLabel}</span>
          </p>
          <p className="mt-4 text-lg text-stone-300">{p.detail}</p>
          <p className="mt-3 text-sm text-stone-400">
            {p.sourceLabel}{" "}
            <a
              href={p.whoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-mint underline underline-offset-4"
            >
              {p.whoLink}
            </a>
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {p.risks.map((risk) => (
            <li
              data-stagger
              key={risk.title}
              className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10 transition-[translate,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-white/[0.06] shadow-(--shadow-card) hover:shadow-(--shadow-float)"
            >
              <p className="text-lg font-semibold">{risk.title}</p>
              <p className="mt-1 text-base text-stone-400">{risk.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

const FEATURE_ICONS = [ICONS.target, ICONS.list, ICONS.coin, ICONS.check, ICONS.share, ICONS.phone];

export function FeaturesSection() {
  const f = useT().features;
  return (
    <Band id="funciones" labelledBy="funciones-title">
      <SectionHeading id="funciones-title" eyebrow={f.eyebrow} title={f.title} />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {f.items.map((item, i) => (
          <li
            data-stagger
            key={item.title}
            className="rounded-2xl bg-ink-2 p-6 ring-1 ring-white/10 transition-[translate,box-shadow,background-color] duration-300 hover:-translate-y-1 shadow-(--shadow-card) hover:shadow-(--shadow-float)"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
              {icon(FEATURE_ICONS[i])}
            </span>
            <p className="mt-4 text-lg font-semibold">{item.title}</p>
            <p className="mt-1 text-base text-stone-400">{item.text}</p>
          </li>
        ))}
      </ul>
    </Band>
  );
}

const PRIVACY_ICONS = [ICONS.eyeOff, ICONS.user, ICONS.clock, ICONS.phone];

export function PrivacySection() {
  const p = useT().privacySection;
  return (
    <Band id="privacidad" labelledBy="privacidad-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            id="privacidad-title"
            eyebrow={p.eyebrow}
            title={p.title}
            intro={p.intro}
          />
          <p className="mt-6 flex items-start gap-3 rounded-xl bg-amber-400/10 p-4 text-base text-amber-100 ring-1 ring-amber-400/30">
            {icon(ICONS.shield, "mt-0.5 size-5")}
            {p.warning}
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {p.items.map((item, i) => (
            <li
              data-stagger
              key={item.title}
              className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10 transition-[translate,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-white/[0.06] shadow-(--shadow-card) hover:shadow-(--shadow-float)"
            >
              <span className="text-mint">{icon(PRIVACY_ICONS[i])}</span>
              <p className="mt-3 text-lg font-semibold">{item.title}</p>
              <p className="mt-1 text-base text-stone-400">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

const VALUE_ICONS = [ICONS.heart, ICONS.globe, ICONS.shield];

/** About the project, plus how the two Meta models work together (one section, not two). */
export function AboutSection() {
  const a = useT().about;
  const tech = useT().tech;
  return (
    <Band id="acerca" tone="stone" labelledBy="acerca-title">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading id="acerca-title" eyebrow={a.eyebrow} title={a.title} />
          <div className="mt-4 space-y-4 text-lg text-stone-300">
            <p>{a.p1}</p>
            <p>
              {a.p2Before} <strong>Meta Global AI Developer Hackathon 2026</strong>, {a.p2Theme}{" "}
              <em>Build for Your World</em>
              {a.p2After}
            </p>
          </div>
        </div>
        <ul className="space-y-4">
          {a.values.map((v, i) => (
            <li
              data-stagger
              key={v.title}
              className="flex gap-4 rounded-xl bg-ink-2 p-5 ring-1 ring-white/10"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
                {icon(VALUE_ICONS[i])}
              </span>
              <div>
                <p className="text-lg font-semibold">{v.title}</p>
                <p className="mt-1 text-base text-stone-400">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div id="tecnologia" className="mt-16 border-t border-white/10 pt-12">
        <h3 className="font-display text-3xl text-white sm:text-4xl">{tech.title}</h3>
        <p className="mt-3 max-w-2xl text-lg text-stone-300">{tech.intro}</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tech.pipeline.map((step, index) => (
            <li
              data-stagger
              key={step.name}
              className="relative rounded-2xl bg-ink p-5 ring-1 ring-white/10"
            >
              <p className="text-sm font-semibold text-mint">{tech.step(index + 1)}</p>
              <p className="mt-1 text-xl font-bold">{step.name}</p>
              <p className="mt-2 text-base text-stone-300">{step.detail}</p>
              {index < tech.pipeline.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-2xl text-mint lg:block"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-base text-stone-300">{tech.honesty}</p>
      </div>
    </Band>
  );
}

export function FaqSection() {
  const faq = useT().faq;
  return (
    <Band id="preguntas" labelledBy="preguntas-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading id="preguntas-title" eyebrow={faq.eyebrow} title={faq.title} />
        <div className="divide-y divide-white/10 rounded-xl ring-1 ring-white/10">
          {faq.items.map((item) => (
            <details key={item.q} className="faq group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="text-2xl text-mint transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-base text-stone-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Band>
  );
}

export function FinalCta() {
  const c = useT().finalCta;
  return (
    <section className="px-4 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink-2 px-6 py-16 text-center text-white ring-1 ring-white/10 sm:px-12 sm:py-24">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 size-[36rem] -translate-x-1/2 glow-blob rounded-full bg-mint/15 blur-3xl"
        />
        <div className="relative">
          <DisplayHeading className="mx-auto max-w-3xl text-5xl sm:text-7xl">
            {c.titleA} <em>{c.titleB}</em>
          </DisplayHeading>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-300 sm:text-xl">{c.text}</p>
          <a
            href="#empezar"
            className="mt-10 inline-flex min-h-14 items-center rounded-full bg-mint px-8 text-lg font-semibold text-ink cta-glow transition hover:bg-mint-soft active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
          >
            <RollText>{c.cta}</RollText>
          </a>
        </div>
      </div>
    </section>
  );
}
