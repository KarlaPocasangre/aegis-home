import { useId, type Ref } from "react";
import { useT } from "../lib/i18n";

// Shown before the first upload (docs/SECURITY.md §1).
export function PrivacyNotice({
  accepted,
  onChange,
  error,
  inputRef,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  /** Shown next to the checkbox when an action needs consent first. */
  error?: string | null;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const p = useT().privacy;
  const errorId = useId();
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700 dark:border-white/10 dark:bg-ink-2 dark:text-stone-300">
      <p className="font-semibold text-stone-900 dark:text-white">{p.title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {p.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 font-medium text-stone-900 dark:text-white">
        <input
          ref={inputRef}
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="size-6 shrink-0 accent-teal-700 dark:accent-mint"
        />
        {p.accept}
      </label>
      {error && (
        <p id={errorId} role="alert" className="mt-1 font-semibold text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
