import { linkHandler } from "../lib/router";
import { useT } from "../lib/i18n";
import { BrandMark } from "./BrandMark";

/** Full lockup: shield, "Aegis Home" wordmark and, optionally, the tagline. */
export function Wordmark({
  tagline = false,
  large = false,
}: {
  tagline?: boolean;
  large?: boolean;
}) {
  const tr = useT();
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark className={large ? "h-14 w-auto" : "h-9 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className={`tracking-tight ${large ? "text-3xl" : "text-xl"}`}>
          <span className="font-extrabold text-white">Aegis</span>{" "}
          <span className="font-medium text-[#8fcfd6]">Home</span>
        </span>
        {tagline && (
          <span
            className={`mt-1.5 font-semibold tracking-[0.22em] text-stone-300 uppercase ${large ? "text-xs" : "text-[0.6rem]"}`}
          >
            {tr.common.tagline}
          </span>
        )}
      </span>
    </span>
  );
}

export function Logo() {
  const tr = useT();
  return (
    <a
      href="/"
      onClick={linkHandler("/")}
      aria-label={tr.common.homeAria}
      className="flex min-h-12 shrink-0 items-center rounded-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
    >
      <Wordmark />
    </a>
  );
}
