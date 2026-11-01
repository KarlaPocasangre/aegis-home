import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { gsap, MOTION_OK, ScrollTrigger } from "./motion";

let lenis: Lenis | null = null;

/**
 * Inertial smooth scrolling for the landing page only (wheel and trackpad). Touch keeps native
 * scrolling, and nothing runs with "reduce motion". Driven by GSAP's ticker so ScrollTrigger
 * animations stay in sync with the smoothed position.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;

    const instance = new Lenis({
      lerp: 0.1,
      // Anchors land below the sticky header through the CSS scroll-margin-top, which Lenis honors.
      anchors: true,
      autoRaf: false,
    });
    const raf = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis = instance;

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  }, []);
}

/** Scrolls to an in-page anchor, smoothly through Lenis when it is running. */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target);
  else target.scrollIntoView();
}
