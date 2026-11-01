import { useEffect, useRef, type ReactNode } from "react";

// Views remount on every navigation. After the first page load, moving focus to the new title
// lets screen readers announce the view (an SPA has no page load to do it).
let initialViewShown = false;

export function ViewTitle({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (initialViewShown) ref.current?.focus({ preventScroll: true });
    initialViewShown = true;
  }, []);

  return (
    <header>
      <h1
        ref={ref}
        tabIndex={-1}
        className="font-display text-4xl leading-tight text-white outline-none sm:text-5xl"
      >
        {children}
      </h1>
      {subtitle && <p className="mt-1 text-base text-stone-400">{subtitle}</p>}
    </header>
  );
}
