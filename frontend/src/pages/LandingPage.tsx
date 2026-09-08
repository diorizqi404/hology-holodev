import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/landing/HeroSection";
import { ContextSection } from "../components/landing/ContextSection";
import { StepsSection } from "../components/landing/StepsSection";
import { SpatialSection } from "../components/landing/SpatialSection";
import { AutoIntelSection } from "../components/landing/AutoIntelSection";
import { HumanInputSection } from "../components/landing/HumanInputSection";
import { TransparencySection } from "../components/landing/TransparencySection";
import { DecisionOptionsSection } from "../components/landing/DecisionOptionsSection";
import { CommunicationSection } from "../components/landing/CommunicationSection";
import { PrinciplesSection } from "../components/landing/PrinciplesSection";
import { CtaSection } from "../components/landing/CtaSection";

export function LandingPage() {
  return (
    <div className="min-w-[300px] overflow-x-hidden bg-stone-100 text-lime-950">
      <Navbar />
      <main>
        <HeroSection />
        <ContextSection />
        <StepsSection />
        <SpatialSection />
        <AutoIntelSection />
        <HumanInputSection />
        <TransparencySection />
        <DecisionOptionsSection />
        <CommunicationSection />
        <PrinciplesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
