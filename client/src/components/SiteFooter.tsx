import type { ReactNode } from "react";
import { LANDING_SECTIONS } from "./LandingNavbar";
import { useT } from "../lib/i18n";
import { Wordmark } from "./Logo";

// The footer also links "About", which the navbar leaves out to stay short.
const FOOTER_SECTIONS = [...LANDING_SECTIONS, { href: "#acerca", key: "about" }] as const;

const REPO_URL = "https://github.com/KarlaPocasangre/aegis-home";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold tracking-wide text-mint uppercase">{title}</h2>
      <div className="mt-3 text-base text-stone-300">{children}</div>
    </div>
  );
}

const footerLink =
  "inline-flex min-h-10 items-center text-stone-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint";

/**
 * `full` on the landing page; `compact` inside an evaluation, where the tab bar is the
 * navigation and the footer only carries the disclaimer.
 */
export function SiteFooter({
  variant = "compact",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const tr = useT();
  const f = tr.footer;
  if (variant === "compact") {
    return (
      <footer className={`border-t border-white/10 bg-ink ${className}`}>
        <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-stone-400">{f.disclaimer}</p>
      </footer>
    );
  }

  return (
    <footer className={`border-t border-white/10 bg-ink px-4 pt-16 pb-8 ${className}`}>
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
        <Column title={f.identityTitle}>
          <Wordmark tagline />
          <p className="mt-3">{f.identityText}</p>
        </Column>

        <Column title={f.navTitle}>
          <ul>
            <li>
              <a href="#inicio" className={footerLink}>
                {f.home}
              </a>
            </li>
            {FOOTER_SECTIONS.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={footerLink}>
                  {tr.landingNav.sections[s.key]}
                </a>
              </li>
            ))}
            <li>
              <a href="#empezar" className={footerLink}>
                {f.startEvaluation}
              </a>
            </li>
          </ul>
        </Column>

        <Column title={f.privacyTitle}>
          <ul className="space-y-2">
            {f.privacyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Column>

        <Column title={f.techTitle}>
          <ul className="space-y-2">
            <li className="text-white">{f.techAi}</li>
            <li>{f.techStack}</li>
            <li>{f.hackathon}</li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {f.github}
              </a>
            </li>
          </ul>
        </Column>
      </div>

      <p
        aria-hidden
        className="mx-auto mt-14 max-w-6xl text-center font-display text-[18vw] leading-[0.85] tracking-tight text-white/[0.07] select-none lg:text-[11.5rem]"
      >
        Aegis Home
      </p>

      <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-sm text-stone-400">
        <p>{f.disclaimer}</p>
        <p className="mt-2">{f.emergency}</p>
        <p className="mt-4">© 2026 Aegis Home</p>
      </div>
    </footer>
  );
}
