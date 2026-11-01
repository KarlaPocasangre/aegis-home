import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { householdPath, linkHandler } from "../lib/router";
import { scrollToHash, setScrollLocked } from "../lib/scrollTo";
import { lastHousehold } from "../lib/storage";
import { useT } from "../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Logo } from "./Logo";

/** In-page anchors, in page order; labels come from the `landingNav.sections` dictionary. */
export const LANDING_SECTIONS = [
  { href: "#como-funciona", key: "how" },
  { href: "#funciones", key: "features" },
  { href: "#ejemplo", key: "example" },
  { href: "#privacidad", key: "privacy" },
  { href: "#preguntas", key: "faq" },
] as const;

const linkBase =
  "flex min-h-12 items-center rounded-lg px-2.5 text-base font-semibold hover:bg-white/5 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint xl:px-3";
const linkState = (active: boolean) =>
  active
    ? "text-white underline decoration-mint decoration-2 underline-offset-[10px]"
    : "text-stone-300";
const ctaClass =
  "flex min-h-12 items-center justify-center rounded-full bg-mint px-4 text-base font-semibold text-ink hover:bg-mint-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint";

/** The section crossing 40% of the viewport height, or null between tracked sections. */
function useActiveSection(hrefs: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const href of hrefs) {
        const rect = document.querySelector(href)?.getBoundingClientRect();
        if (rect && rect.top <= line && rect.bottom > line) current = href;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [hrefs]);
  return active;
}

/** Moves focus to the section's heading so keyboard and screen-reader users land with it. */
function focusSection(href: string) {
  const target = document.querySelector<HTMLElement>(href);
  const heading = target?.querySelector<HTMLElement>("h2, h3") ?? target;
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

const SECTION_HREFS = LANDING_SECTIONS.map((s) => s.href);

// The landing page is one linear flow: in-page anchors (smooth scroll) instead of views.
// On phones the anchors fold into a menu; the main action stays visible next to it.
export function LandingNavbar() {
  const tr = useT();
  const nav = tr.landingNav;
  const saved = lastHousehold.get();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(SECTION_HREFS);

  // Close first, scroll after the menu collapses: collapsing mid-scroll cancels smooth scrolling.
  const goTo = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      scrollToHash(href);
      window.history.replaceState(null, "", href);
      focusSection(href);
    });
  };

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open]);

  const cta = saved ? (
    <a href={householdPath(saved)} onClick={linkHandler(householdPath(saved))} className={ctaClass}>
      {nav.myEvaluation}
    </a>
  ) : (
    <a href="#empezar" onClick={goTo("#empezar")} className={ctaClass}>
      {nav.start}
    </a>
  );

  const links = (extra = "") =>
    LANDING_SECTIONS.map((s) => (
      <li key={s.href}>
        <a
          href={s.href}
          onClick={goTo(s.href)}
          aria-current={active === s.href ? "true" : undefined}
          className={`${linkBase} ${linkState(active === s.href)} ${extra}`}
        >
          {nav.sections[s.key]}
        </a>
      </li>
    ));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
          <Logo />
          <nav aria-label={nav.aria} className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">{links()}</ul>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <div className="hidden items-center gap-1 lg:flex">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <span aria-hidden className="mx-1 h-6 w-px bg-white/15" />
            </div>
            {cta}
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((o) => !o)}
              className="flex size-12 items-center justify-center rounded-lg text-stone-100 ring-1 ring-white/20 hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint lg:hidden"
            >
              <span className="sr-only">{open ? nav.closeMenu : nav.openMenu}</span>
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
            aria-label={nav.aria}
            className="border-t border-white/10 bg-ink px-4 pb-4 lg:hidden"
          >
            <ul className="mx-auto max-w-5xl pt-2">{links("text-lg")}</ul>
            <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="text-sm font-semibold text-stone-400">{nav.settings}</span>
              <div className="flex items-center gap-1">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        )}
      </header>
      {/* Outside the header: its backdrop-filter would make it the containing block. */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
