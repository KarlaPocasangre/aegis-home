import { useRef, type ReactNode } from "react";
import { useLineReveal, useStaggerIn } from "../../lib/motion";

const TONES = {
  white: "bg-white",
  stone: "bg-stone-50",
  teal: "bg-teal-900 text-white",
} as const;

/** Full-width landing band with a centered column. Children marked `data-stagger` fade up in turn. */
export function Band({
  id,
  tone = "white",
  labelledBy,
  children,
}: {
  id: string;
  tone?: keyof typeof TONES;
  labelledBy?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useStaggerIn(ref);
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONES[tone]} px-4 py-20 sm:py-28`}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

/** Display heading whose lines rise into view. */
export function DisplayHeading({
  id,
  as: Tag = "h2",
  className = "",
  children,
}: {
  id?: string;
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLineReveal(ref);
  return (
    <Tag ref={ref} id={id} className={`font-display leading-[1.05] tracking-tight ${className}`}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  invert = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  invert?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p
        className={`text-sm font-bold tracking-widest uppercase ${invert ? "text-teal-200" : "text-teal-700"}`}
      >
        {eyebrow}
      </p>
      <DisplayHeading id={id} className="mt-3 text-4xl sm:text-6xl">
        {title}
      </DisplayHeading>
      {intro && (
        <p className={`mt-5 text-lg ${invert ? "text-teal-50" : "text-stone-700"}`}>{intro}</p>
      )}
    </div>
  );
}

export const icon = (d: ReactNode, className = "size-6") => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className={`${className} shrink-0`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

export const ICONS = {
  camera: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h1.5l1.5-2h6l1.5 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>
  ),
  sparkle: (
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5c-.4-.9-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1.2 0-2.1-.6-2.5-1.5M12 6.5V8M12 16v1.5" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  phone: (
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
  ),
  check: <path d="m5 12 4 4 10-10" />,
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12.6 12.6 0 0 1-2.4 3.2M6.6 6.6C4.4 8 3 10.2 2.5 12c1 2 4.5 6 9.5 6 1.6 0 3-.4 4.3-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5S14.3 18.1 12 20.5C9.7 18.1 8.5 15.3 8.5 12S9.7 5.9 12 3.5z" />
    </>
  ),
};
