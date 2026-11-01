import { useT } from "../lib/i18n";
import { setThemePref, useTheme, type ThemePref } from "../lib/theme";

const svg = (children: React.ReactNode) => (
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
    {children}
  </svg>
);

const SUN = svg(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);
const MOON = svg(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />);
const AUTO = svg(
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

/**
 * Header: one button that flips between light and dark (showing the mode it switches to).
 * `inline` (settings page): System / Light / Dark, where "System" follows the device.
 */
export function ThemeSwitcher({ inline = false }: { inline?: boolean }) {
  const tr = useT().theme;
  const { pref, theme } = useTheme();

  if (inline) {
    const options: { value: ThemePref; label: string; icon: React.ReactNode }[] = [
      { value: "system", label: tr.system, icon: AUTO },
      { value: "light", label: tr.light, icon: SUN },
      { value: "dark", label: tr.dark, icon: MOON },
    ];
    return (
      <div role="group" aria-label={tr.title} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={pref === o.value}
            onClick={() => setThemePref(o.value)}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-base font-semibold ring-1 transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint ${
              pref === o.value
                ? "bg-mint/15 text-mint ring-mint/40"
                : "text-stone-200 ring-white/15 hover:bg-white/10"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setThemePref(next)}
      aria-label={next === "light" ? tr.toLight : tr.toDark}
      title={next === "light" ? tr.toLight : tr.toDark}
      className="flex size-12 items-center justify-center rounded-full text-stone-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
    >
      {next === "light" ? SUN : MOON}
    </button>
  );
}
