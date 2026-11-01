import type { ReactNode } from "react";
import { LANDING_SECTIONS } from "./LandingNavbar";

const REPO_URL = "https://github.com/KarlaPocasangre/aegis-home";

const DISCLAIMER =
  "aegis-home señala riesgos del entorno con inteligencia artificial y puede equivocarse. No da consejos médicos, no detecta caídas y no es un servicio de emergencias. Los costos son aproximados.";

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
  if (variant === "compact") {
    return (
      <footer className={`border-t border-stone-200 bg-white ${className}`}>
        <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-stone-600">{DISCLAIMER}</p>
      </footer>
    );
  }

  return (
    <footer className={`border-t border-white/10 bg-ink px-4 pt-16 pb-8 ${className}`}>
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
        <Column title="Identidad y propósito">
          <p className="flex items-center gap-2 text-xl font-bold text-white">
            <img src="/favicon.svg" alt="" className="size-7" />
            aegis-home
          </p>
          <p className="mt-3">
            Prevención de caídas en casa para familias de Centroamérica y Latinoamérica: de una foto
            a un plan claro, en español.
          </p>
        </Column>

        <Column title="Navegación rápida">
          <ul>
            <li>
              <a href="#inicio" className={footerLink}>
                Inicio
              </a>
            </li>
            {LANDING_SECTIONS.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={footerLink}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#empezar" className={footerLink}>
                Empezar una evaluación
              </a>
            </li>
          </ul>
        </Column>

        <Column title="Privacidad y seguridad">
          <ul className="space-y-2">
            <li>Las fotos se analizan y no se guardan.</li>
            <li>Sin cuentas ni datos personales.</li>
            <li>Cada evaluación se borra a los 30 días.</li>
            <li>Contactos guardados solo en su dispositivo.</li>
          </ul>
        </Column>

        <Column title="Tecnologías y créditos">
          <ul className="space-y-2">
            <li>
              IA de <strong className="text-white">Meta</strong>: Muse Spark 1.3 y SAM 3.1
            </li>
            <li>React, Tailwind CSS, Node.js, Express y PostgreSQL</li>
            <li>Creado para el Meta Global AI Developer Hackathon 2026</li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={footerLink}>
                Código abierto en GitHub
              </a>
            </li>
          </ul>
        </Column>
      </div>

      <p
        aria-hidden
        className="mx-auto mt-14 max-w-6xl text-center font-display text-[18vw] leading-[0.85] tracking-tight text-white/[0.07] select-none lg:text-[11.5rem]"
      >
        aegis-home
      </p>

      <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-sm text-stone-400">
        <p>{DISCLAIMER}</p>
        <p className="mt-2">En una emergencia, llame al 911.</p>
        <p className="mt-4">© 2026 aegis-home</p>
      </div>
    </footer>
  );
}
