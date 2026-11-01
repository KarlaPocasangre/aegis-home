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
      <h1 ref={ref} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
        {children}
      </h1>
      {subtitle && <p className="mt-1 text-base text-stone-600">{subtitle}</p>}
    </header>
  );
}
