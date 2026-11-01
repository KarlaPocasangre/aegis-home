import { householdPath, linkHandler } from "../lib/router";

/** Shown when nothing has been analyzed yet: one clear next step. */
export function EmptyState({ token, text }: { token: string; text: string }) {
  const path = householdPath(token, "analizar");
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-300 bg-white p-6 text-center">
      <p className="text-base text-stone-700">{text}</p>
      <a
        href={path}
        onClick={linkHandler(path)}
        className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-teal-700 px-5 text-base font-semibold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Analizar un espacio
      </a>
    </div>
  );
}
