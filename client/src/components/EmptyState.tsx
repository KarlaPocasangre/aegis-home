import { useT } from "../lib/i18n";
import { householdPath, linkHandler } from "../lib/router";

/** Shown when nothing has been analyzed yet: one clear next step. */
export function EmptyState({ token, text }: { token: string; text: string }) {
  const tr = useT();
  const path = householdPath(token, "analizar");
  return (
    <div className="rounded-xl border-2 border-dashed border-white/15 bg-white/[0.04] p-6 text-center">
      <p className="text-base text-stone-300">{text}</p>
      <a
        href={path}
        onClick={linkHandler(path)}
        className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-mint px-5 text-base font-semibold text-ink hover:bg-mint-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
      >
        {tr.household.analyzeCta}
      </a>
    </div>
  );
}
