import { AnalysisSection } from "./landing/AnalysisSection";
import { HeroSection } from "./landing/HeroSection";
import {
  AboutSection,
  FaqSection,
  FeaturesSection,
  FinalCta,
  HowItWorksSection,
  PrivacySection,
  ProblemSection,
  TechSection,
} from "./landing/InfoSections";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
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
