import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../lib/motion";

/**
 * A paragraph whose words darken one by one as it scrolls through the viewport. Without motion
 * it is simply the dark paragraph.
 */
export function ScrollFillText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} data-word>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
