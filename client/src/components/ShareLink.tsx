import { useState } from "react";
import { useT } from "../lib/i18n";
import { householdPath } from "../lib/router";

export function ShareLink({ token }: { token: string }) {
  const tr = useT();
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${householdPath(token)}`;
  // Phones offer their own share sheet (WhatsApp, SMS…), the natural way to reach family.
  const canShare = typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(tr.share.promptCopy, url);
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Aegis Home", text: tr.share.message, url });
    } catch (err) {
      // Closing the share sheet is not an error; anything else falls back to copying.
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copy();
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
      <p className="font-semibold">{tr.share.title}</p>
      <p className="mt-1 text-sm text-stone-400">{tr.share.warning}</p>
      {canShare && (
        <button
          type="button"
          onClick={share}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 text-base font-semibold text-ink hover:bg-mint-soft"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
          </svg>
          {tr.share.shareButton}
        </button>
      )}
      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={url}
          aria-label={tr.share.linkLabel}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/15 bg-ink px-3 text-sm text-stone-300"
        />
        <button
          type="button"
          onClick={copy}
          className="min-h-12 shrink-0 rounded-lg bg-white/10 px-4 text-base font-semibold text-white hover:bg-white/20"
        >
          {copied ? tr.common.copied : tr.common.copy}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? tr.common.copied : ""}
      </p>
    </div>
  );
}
