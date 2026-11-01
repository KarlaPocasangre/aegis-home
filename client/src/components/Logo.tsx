import { linkHandler } from "../lib/router";

export function Logo() {
  return (
    <a
      href="/"
      onClick={linkHandler("/")}
      className="flex min-h-12 shrink-0 items-center gap-2 rounded-lg text-lg font-bold text-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      <img src="/favicon.svg" alt="" className="size-7" />
      aegis-home
    </a>
  );
}
