import { useT } from "../lib/i18n";

// Shown before the first upload (docs/SECURITY.md §1).
export function PrivacyNotice({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  const p = useT().privacy;
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700 dark:border-white/10 dark:bg-ink-2 dark:text-stone-300">
      <p className="font-semibold text-stone-900 dark:text-white">{p.title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {p.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <label className="mt-3 flex items-start gap-2 font-medium text-stone-900 dark:text-white">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 accent-teal-700 dark:accent-mint"
        />
        {p.accept}
      </label>
    </div>
  );
}
