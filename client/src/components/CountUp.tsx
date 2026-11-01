import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../lib/motion";

interface Props {
  to: number;
  format?: (value: number) => string;
  delay?: number;
}

/**
 * Rolls a number up from 0 when it scrolls into view. The final value is the server-rendered
 * text, so screen readers and reduced-motion users always get the real number.
 */
export function CountUp({ to, format = (v) => String(Math.round(v)), delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const state = { value: 0 };
        el.textContent = format(0);
        gsap.to(state, {
          value: to,
          duration: 1.4,
          delay,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format(state.value);
          },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
        return () => {
          el.textContent = format(to);
        };
      });
      return () => mm.revert();
    },
    { dependencies: [to] },
  );

  return (
    <span ref={ref} className="tabular-nums">
      {format(to)}
    </span>
  );
}
