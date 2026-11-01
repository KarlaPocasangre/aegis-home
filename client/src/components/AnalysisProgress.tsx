import { useEffect, useState } from "react";
import { useT } from "../lib/i18n";

/**
 * Wait state while the AI works: the photo being analyzed with a scan line, and a message that
 * moves on with elapsed time only (it never pretends to know real progress).
 */
export function AnalysisProgress({ previewUrl }: { previewUrl?: string }) {
  const p = useT().progress;
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stage = seconds < 8 ? p.review : seconds < 20 ? p.search : p.slow;

  return (
    <div className="overflow-hidden rounded-lg bg-teal-50 text-teal-950 dark:bg-mint/10 dark:text-mint-soft">
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt={p.previewAlt}
            className="block max-h-64 w-full object-cover opacity-80"
          />
          <div
            aria-hidden
            className="scan-line pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-mint/40 to-transparent"
          />
        </div>
      )}
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          aria-hidden
          className="mt-1 inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-teal-700 border-t-transparent motion-reduce:animate-none dark:border-mint dark:border-t-transparent"
        />
        {/* Only the stage is announced: a counter ticking every second would flood screen readers. */}
        <p role="status" className="flex-1 text-base font-semibold">
          {stage}
        </p>
        <span aria-hidden className="text-sm tabular-nums opacity-80">
          {p.seconds(seconds)}
        </span>
      </div>
    </div>
  );
}
