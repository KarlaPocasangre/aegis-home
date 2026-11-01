import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };

/**
 * Every animation is created inside this query. With "reduce motion" on, nothing is created:
 * content renders in its final, fully visible state (no element starts hidden in CSS).
 */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export function prefersMotion() {
  return window.matchMedia(MOTION_OK).matches;
}

/** Lines rise from behind a mask when the heading scrolls into view. */
export function useLineReveal(ref: RefObject<HTMLElement | null>, opts: { delay?: number } = {}) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.08,
              delay: opts.delay ?? 0,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}

/** Children marked `[data-stagger]` fade up one after another when the container appears. */
export function useStaggerIn(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-stagger]", {
          y: 32,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
