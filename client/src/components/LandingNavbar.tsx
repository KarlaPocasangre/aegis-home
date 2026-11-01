import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { householdPath, linkHandler } from "../lib/router";
import { scrollToHash } from "../lib/smoothScroll";
import { lastHousehold } from "../lib/storage";
import { Logo } from "./Logo";

export const LANDING_SECTIONS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#ejemplo", label: "Ejemplo" },
  { href: "#privacidad", label: "Privacidad" },
  { href: "#acerca", label: "Acerca" },
  { href: "#preguntas", label: "Preguntas" },
];

const linkClass =
  "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold text-stone-300 hover:bg-white/5 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint";
const ctaClass =
  "flex min-h-12 items-center justify-center rounded-full bg-mint px-4 text-base font-semibold text-ink hover:bg-mint-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint";

// The landing page is one linear flow: in-page anchors (smooth scroll) instead of views.
// On phones the anchors fold into a menu; the main action stays visible next to it.
export function LandingNavbar() {
  const saved = lastHousehold.get();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close first, scroll after the menu collapses: collapsing mid-scroll cancels smooth scrolling.
  const goTo = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      scrollToHash(href);
      window.history.replaceState(null, "", href);
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cta = saved ? (
    <a href={householdPath(saved)} onClick={linkHandler(householdPath(saved))} className={ctaClass}>
      Mi evaluación
    </a>
  ) : (
    <a href="#empezar" onClick={goTo("#empezar")} className={ctaClass}>
      Empezar
    </a>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
        <Logo />
        <nav aria-label="Secciones de la página" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {LANDING_SECTIONS.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={linkClass}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {cta}
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
            className="flex size-12 items-center justify-center rounded-lg text-stone-100 ring-1 ring-white/20 hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint lg:hidden"
          >
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id={menuId}
          aria-label="Secciones de la página"
          className="border-t border-white/10 bg-ink px-4 pb-4 lg:hidden"
        >
          <ul className="mx-auto max-w-5xl pt-2">
            {LANDING_SECTIONS.map((s) => (
              <li key={s.href}>
                <a href={s.href} onClick={goTo(s.href)} className={`${linkClass} text-lg`}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
