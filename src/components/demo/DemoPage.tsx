import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DemoTour } from "./DemoTour";
import { DemoDashboard } from "./DemoDashboard";
import logger from "@/utils/core/common/logger";

/**
 * Demo Page - "Hyperspeed" Technical Demo
 *
 * Showcases v2.1 features:
 * - Go Engine (6,000 tx/sec)
 * - Python Analytics (ML predictions)
 * - SentinelShare (E2EE receipt matching)
 *
 * Includes guided interactive tour for new visitors
 */
const DemoPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logger.info("🚀 Demo Page loaded - Hyperspeed mode");
  }, []);

  const handleTourComplete = () => {
    logger.info("✅ Demo tour completed");
    // Tour completion is handled by DemoTour component
  };

  const handleSignUpRedirect = () => {
    logger.info("🔗 Redirecting to sign up from demo CTA");
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-slate-50">
      <DemoTour onComplete={handleTourComplete} onSignUpRedirect={handleSignUpRedirect} />

      {/* Header */}
      <header className="border-b-2 border-black bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono font-black text-white">
              VIOLET VAULT <span className="text-purple-400">// HYPERSPEED DEMO</span>
            </h1>
            {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Demo page uses custom mono font styling */}
            <button
              id="ready-to-vault-button"
              onClick={handleSignUpRedirect}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold border-2 border-black rounded-none transition-colors"
            >
              READY TO VAULT?
            </button>
          </div>
        </div>
      </header>

      {/* Main Demo Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <DemoDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <p className="text-sm font-mono text-slate-400">
            This is a technical demonstration. Data shown is simulated.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;
