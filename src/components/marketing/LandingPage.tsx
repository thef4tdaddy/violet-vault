import React from "react";
import { HeroSection } from "./HeroSection";
import { TechStackBar } from "./TechStackBar";
import { ComparisonSection } from "./ComparisonSection";
import { DevBlogGrid } from "./DevBlogGrid";
import { MarketingFooter } from "./MarketingFooter";

/**
 * Marketing Landing Page Root
 * Orchestrates the "Front Door" experience.
 */
const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50 selection:bg-fuchsia-500/30">
      <HeroSection />
      <TechStackBar />
      <ComparisonSection />
      <DevBlogGrid />
      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
