// Kept tiny and dependency-free: the always-loaded navbar uses it, while Lenis and GSAP stay in
// the lazily loaded landing chunk and register themselves here when they run.
interface SmoothScroller {
  scrollTo(target: HTMLElement): void;
  stop(): void;
  start(): void;
}

let scroller: SmoothScroller | null = null;

export function setSmoothScroller(next: SmoothScroller | null) {
  scroller = next;
}

function scrollToElement(target: HTMLElement) {
  if (scroller) scroller.scrollTo(target);
  else target.scrollIntoView({ behavior: "smooth" });
}

/** Scrolls to an in-page anchor, smoothly through Lenis when it is running. */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (target) scrollToElement(target);
}

/**
 * Brings an element into view only when part of it is off screen. `margin` keeps it clear of
 * fixed bars (sticky header, phone tab bar, floating contact button).
 */
export function revealElement(target: HTMLElement | null, margin = 96) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
  scrollToElement(target);
}

/** Freezes page scrolling behind an overlay (native and Lenis). */
export function setScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) scroller?.stop();
  else scroller?.start();
}
