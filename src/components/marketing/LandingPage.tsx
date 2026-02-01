import React from "react";
import { HeroSection } from "./HeroSection";

/**
 * Marketing Landing Page Root
 * Orchestrates the "Front Door" experience.
 */
const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50 selection:bg-fuchsia-500/30">
      <HeroSection />
      {/* 
        Phase 2 & 3 Components will be added here:
        <ComparisonSection />
        <TechStackBar />
        <DevBlogGrid /> 
        <MarketingFooter />
      */}
    </div>
  );
};

export default LandingPage;
