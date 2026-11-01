import { householdPath, linkHandler } from "../lib/router";
import { lastHousehold } from "../lib/storage";
import { Logo } from "./Logo";

const ANCHORS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#empezar", label: "Empezar" },
];

// The landing page is one short, linear flow: in-page anchors (smooth scroll) instead of views.
export function LandingNavbar() {
  const saved = lastHousehold.get();
  const savedPath = saved ? householdPath(saved) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
        <Logo />
        <nav aria-label="Secciones de la página" className="ml-auto">
          <ul className="flex items-center gap-1">
            {ANCHORS.map((a) => (
              <li key={a.href} className={savedPath ? "hidden sm:block" : ""}>
                <a
                  href={a.href}
                  className="flex min-h-12 items-center rounded-lg px-3 text-base font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {a.label}
                </a>
              </li>
            ))}
            {savedPath && (
              <li>
                <a
                  href={savedPath}
                  onClick={linkHandler(savedPath)}
                  className="ml-1 flex min-h-12 items-center rounded-lg bg-teal-700 px-4 text-base font-semibold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Mi evaluación
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
