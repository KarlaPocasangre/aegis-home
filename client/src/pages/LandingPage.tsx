import { useSmoothScroll } from "../lib/smoothScroll";
import { AnalysisSection } from "./landing/AnalysisSection";
import { HeroSection } from "./landing/HeroSection";
import { HowItWorksStory } from "./landing/HowItWorksStory";
import {
  AboutSection,
  FaqSection,
  FeaturesSection,
  FinalCta,
  PrivacySection,
  ProblemSection,
} from "./landing/InfoSections";

// Sales order: problem → how → what you get → try it → trust (privacy, about) → objections → CTA.
export function LandingPage() {
  useSmoothScroll();
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksStory />
      <FeaturesSection />
      <AnalysisSection />
      <PrivacySection />
      <AboutSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
