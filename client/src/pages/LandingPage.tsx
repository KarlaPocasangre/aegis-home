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
  TechSection,
} from "./landing/InfoSections";

export function LandingPage() {
  useSmoothScroll();
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksStory />
      <AnalysisSection />
      <FeaturesSection />
      <TechSection />
      <PrivacySection />
      <AboutSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
