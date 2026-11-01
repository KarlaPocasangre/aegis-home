import { useEffect, useId, useRef, useState } from "react";
import { LANGUAGES, setLang, useLang, useT } from "../lib/i18n";

const globe = (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5S14.3 18.1 12 20.5C9.7 18.1 8.5 15.3 8.5 12S9.7 5.9 12 3.5z" />
  </svg>
);

/**
 * Compact menu button (globe + "ES") that opens the three languages, each named in itself.
 * `inline` renders the options as a row of buttons instead, for menus and the settings page.
 */
export function LanguageSwitcher({ inline = false }: { inline?: boolean }) {
  const lang = useLang();
  const tr = useT();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const options = LANGUAGES.map((l) => (
    <button
      key={l.code}
      type="button"
      lang={l.code}
      aria-pressed={l.code === lang}
      onClick={() => {
        setLang(l.code);
        setOpen(false);
      }}
      className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-base font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint ${
        l.code === lang ? "bg-mint/15 text-mint" : "text-stone-200 hover:bg-white/10"
      } ${inline ? "flex-1 justify-center ring-1 ring-white/15" : "w-full"}`}
    >
      <span aria-hidden className="w-7 text-sm font-bold opacity-70">
        {l.short}
      </span>
      {l.label}
    </button>
  ));

  if (inline) {
    return (
      <div role="group" aria-label={tr.common.language} className="flex flex-wrap gap-2">
        {options}
      </div>
    );
  }

  const currentShort = LANGUAGES.find((l) => l.code === lang)?.short ?? "ES";
  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-stone-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
      >
        {globe}
        <span aria-hidden>{currentShort}</span>
        <span className="sr-only">
          {tr.common.language}: {LANGUAGES.find((l) => l.code === lang)?.label}
        </span>
      </button>
      {open && (
        <div
          id={menuId}
          role="group"
          aria-label={tr.common.language}
          className="absolute right-0 z-40 mt-2 w-52 rounded-xl bg-ink-2 p-1.5 shadow-(--shadow-float) ring-1 ring-white/10"
        >
          {options}
        </div>
      )}
    </div>
  );
}
