// Kept tiny and dependency-free: the always-loaded navbar uses it, while Lenis and GSAP stay in
// the lazily loaded landing chunk and register themselves here when they run.
interface SmoothScroller {
  scrollTo(target: HTMLElement): void;
}

let scroller: SmoothScroller | null = null;

export function setSmoothScroller(next: SmoothScroller | null) {
  scroller = next;
}

/** Scrolls to an in-page anchor, smoothly through Lenis when it is running. */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (scroller) scroller.scrollTo(target);
  else target.scrollIntoView();
}
