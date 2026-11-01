import type { ReactNode } from "react";
import { householdPath, linkHandler, type HouseholdView } from "../lib/router";
import { useT } from "../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Logo } from "./Logo";

const icon = (d: ReactNode) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-6 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const TABS: { view: HouseholdView; icon: ReactNode }[] = [
  {
    view: "plan",
    icon: icon(
      <>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </>,
    ),
  },
  {
    view: "analizar",
    icon: icon(
      <>
        <path d="M4 8a2 2 0 0 1 2-2h1.5l1.5-2h6l1.5 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <circle cx="12" cy="12.5" r="3.5" />
      </>,
    ),
  },
  {
    view: "espacios",
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-9 9" />
      </>,
    ),
  },
  {
    view: "ajustes",
    icon: icon(
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>,
    ),
  },
];

interface Props {
  token: string;
  view: HouseholdView;
  householdName: string | null;
  pendingCount: number;
  analyzing: boolean;
}

/** Live hint on a tab: pending hazards on Plan, a running analysis on Analizar. */
function TabHint({
  view,
  pendingCount,
  analyzing,
}: Pick<Props, "pendingCount" | "analyzing"> & {
  view: HouseholdView;
}) {
  const tr = useT();
  if (view === "plan" && pendingCount > 0) {
    return (
      <span className="rounded-full bg-rose-700 px-2 py-0.5 text-xs leading-none font-bold whitespace-nowrap text-snow">
        {pendingCount}
        <span className="sr-only"> {tr.nav.pending}</span>
      </span>
    );
  }
  if (view === "analizar" && analyzing) {
    return (
      <span className="relative flex size-2.5" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint/100 opacity-75 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-mint" />
      </span>
    );
  }
  return null;
}

/**
 * Top bar on every screen size; on phones the sections move to a fixed bottom tab bar, always
 * visible and within thumb reach (a hamburger would hide them behind an unfamiliar icon).
 * Only one of the two <nav>s is displayed at a time, so assistive tech sees a single menu.
 */
export function Navbar({ token, view, householdName, pendingCount, analyzing }: Props) {
  const tr = useT();
  const tab = (t: (typeof TABS)[number], variant: "top" | "bottom") => {
    const path = householdPath(token, t.view);
    const current = t.view === view;
    const hint = <TabHint view={t.view} pendingCount={pendingCount} analyzing={analyzing} />;
    if (variant === "top") {
      return (
        <a
          key={t.view}
          href={path}
          onClick={linkHandler(path)}
          aria-current={current ? "page" : undefined}
          className={`flex min-h-12 items-center gap-2 rounded-lg px-3 text-base font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint ${current ? "bg-mint/10 text-mint underline decoration-2 underline-offset-8" : "text-stone-300 hover:bg-white/5 hover:text-white"}`}
        >
          {t.icon}
          {tr.nav.tabs[t.view]}
          {hint}
        </a>
      );
    }
    return (
      <a
        key={t.view}
        href={path}
        onClick={linkHandler(path)}
        aria-current={current ? "page" : undefined}
        className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-sm font-semibold focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-mint ${current ? "text-mint" : "text-stone-400"}`}
      >
        {current && (
          <span aria-hidden className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-mint" />
        )}
        <span className="relative">
          {t.icon}
          <span className="absolute -top-1.5 left-4 flex">{hint}</span>
        </span>
        {tr.nav.tabs[t.view]}
      </a>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-2">
          <Logo />
          {householdName && (
            <p className="hidden min-w-0 truncate border-l border-white/15 pl-4 text-stone-300 md:block">
              {householdName}
            </p>
          )}
          <nav aria-label={tr.nav.aria} className="ml-auto hidden sm:block">
            <ul className="flex gap-1">
              {TABS.map((t) => (
                <li key={t.view}>{tab(t, "top")}</li>
              ))}
            </ul>
          </nav>
          {/* Phones have room next to the logo; sm–lg uses Ajustes so the tabs keep their space. */}
          <div className="ml-auto flex items-center gap-2 sm:hidden lg:ml-0 lg:flex">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <nav
        aria-label={tr.nav.aria}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.5)] sm:hidden"
      >
        <ul className="flex">
          {TABS.map((t) => (
            <li key={t.view} className="flex flex-1">
              {tab(t, "bottom")}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
