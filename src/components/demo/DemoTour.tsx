import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, Step, Styles, Locale } from "react-joyride";
import logger from "@/utils/core/common/logger";

const TOUR_STORAGE_KEY = "violet-vault-demo-tour-seen";

interface DemoTourProps {
  onComplete: () => void;
  onSignUpRedirect: () => void;
}

/**
 * Demo Tour Component
 * Guided interactive tour using react-joyride
 *
 * Design:
 * - Sharp corners (rounded-none)
 * - Heavy black borders (border-2 border-black)
 * - Mono font (JetBrains Mono)
 * - Backdrop blur scrim
 */
export const DemoTour: React.FC<DemoTourProps> = ({ onComplete, onSignUpRedirect }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      // Auto-trigger tour after a short delay
      const timer = setTimeout(() => {
        setRun(true);
        logger.info("🎯 Starting demo tour");
      }, 500);
      return () => clearTimeout(timer);
    } else {
      logger.info("ℹ️ Demo tour already seen, skipping");
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    logger.debug("Tour callback", { action, index, status, type });

    if (type === "step:after") {
      setStepIndex(index + (action === "next" ? 1 : -1));
    }

    // Handle tour completion or skip
    if (status === "finished" || status === "skipped") {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      logger.info("✅ Demo tour completed/skipped", { status });
      onComplete();

      // If finished (not skipped), redirect to sign up
      if (status === "finished") {
        setTimeout(() => {
          onSignUpRedirect();
        }, 500);
      }
    }
  };

  const steps: Step[] = [
    {
      target: "#demo-intro",
      content: (
        <div className="font-mono">
          <h3 className="text-xl font-black mb-2">WELCOME TO THE POLYGLOT ENGINE</h3>
          <p className="text-sm text-slate-300">
            This interactive demo showcases Violet Vault's v2.1 architecture: a high-performance Go
            backend, intelligent Python analytics, and military-grade encryption.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#demo-go-speed",
      content: (
        <div className="font-mono">
          <h3 className="text-xl font-black mb-2">⚡ GO SPEED</h3>
          <p className="text-sm text-slate-300">
            Our Go-powered transaction engine processes{" "}
            <strong>6,000 transactions per second</strong>. That's fast enough to handle your entire
            financial history in milliseconds.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#demo-python-brain",
      content: (
        <div className="font-mono">
          <h3 className="text-xl font-black mb-2">🧠 PYTHON BRAIN</h3>
          <p className="text-sm text-slate-300">
            Machine learning algorithms predict your paycheck splits with 95%+ accuracy. The system
            learns from your patterns to automate envelope allocation.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#demo-sentinel-match",
      content: (
        <div className="font-mono">
          <h3 className="text-xl font-black mb-2">🔐 SENTINEL MATCH</h3>
          <p className="text-sm text-slate-300">
            SentinelShare reconciles receipts with transactions using end-to-end encryption. Your
            data is encrypted on-device and never exposed to our servers.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "#ready-to-vault-button",
      content: (
        <div className="font-mono">
          <h3 className="text-xl font-black mb-2">🚀 READY TO VAULT?</h3>
          <p className="text-sm text-slate-300">
            Experience the future of envelope budgeting. Sign up now to get started with your own
            encrypted financial vault.
          </p>
        </div>
      ),
      placement: "bottom",
    },
  ];

  // Custom styles matching design language
  const tourStyles: Partial<Styles> = {
    options: {
      arrowColor: "#000",
      backgroundColor: "#1e293b",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      primaryColor: "#a855f7",
      textColor: "#f1f5f9",
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: 0, // Sharp corners
      border: "2px solid #000", // Heavy black border
      fontFamily: "JetBrains Mono, monospace",
      backdropFilter: "blur(4px)",
    },
    tooltipContainer: {
      textAlign: "left",
    },
    tooltipContent: {
      padding: "16px",
    },
    buttonNext: {
      backgroundColor: "#a855f7",
      borderRadius: 0,
      border: "2px solid #000",
      fontFamily: "JetBrains Mono, monospace",
      fontWeight: "bold",
      padding: "8px 16px",
    },
    buttonBack: {
      color: "#cbd5e1",
      fontFamily: "JetBrains Mono, monospace",
      marginRight: "8px",
    },
    buttonSkip: {
      color: "#94a3b8",
      fontFamily: "JetBrains Mono, monospace",
    },
    beaconInner: {
      backgroundColor: "#a855f7",
    },
    beaconOuter: {
      backgroundColor: "#a855f7",
      border: "2px solid #a855f7",
    },
  };

  // Custom locale for button text
  const locale: Locale = {
    back: "← BACK",
    close: "CLOSE",
    last: "FINISH →",
    next: "NEXT →",
    open: "Open the dialog",
    skip: "SKIP TOUR",
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      styles={tourStyles}
      locale={locale}
      disableScrolling={false}
      spotlightPadding={8}
      disableOverlayClose
    />
  );
};
