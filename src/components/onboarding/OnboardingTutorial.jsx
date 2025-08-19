import React, { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle, Target } from "lucide-react";
import useOnboardingStore from "../../stores/onboardingStore";
import logger from "../../utils/logger";

/**
 * OnboardingTutorial - Provides guided tours and contextual hints for new users
 */
const OnboardingTutorial = ({ children }) => {
  const {
    isOnboarded,
    currentTutorialStep,
    endTutorialStep,
    markStepComplete,
    startTutorialStep,
    getProgress,
    preferences,
    setPreference,
  } = useOnboardingStore();

  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const overlayRef = useRef(null);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      id: "welcome",
      title: "Welcome to VioletVault! 🎉",
      description: "Let's take a quick tour to get you started with envelope budgeting and personal finance tracking.",
      target: null,
      position: "center",
      action: () => logger.info("Welcome step shown"),
    },
    {
      id: "set-bank-balance",
      title: "Set Your Bank Balance 🏦",
      description: "First, let's set your current actual bank account balance so we can track your real money.",
      target: "[data-tour='actual-balance']",
      position: "bottom",
      action: () => startTutorialStep("firstBankBalance"),
    },
    {
      id: "add-debts",
      title: "Add Your Debts (Optional) 💳",
      description: "Track credit cards, loans, and other debts to get a complete financial picture.",
      target: "[data-tour='add-debt']",
      position: "bottom",
      action: () => startTutorialStep("firstDebts"),
    },
    {
      id: "add-bills",
      title: "Set Up Recurring Bills (Optional) 📋", 
      description: "Add bills like rent, utilities, subscriptions to plan for upcoming expenses.",
      target: "[data-tour='add-bill']",
      position: "bottom",
      action: () => startTutorialStep("firstBills"),
    },
    {
      id: "add-paycheck",
      title: "Add Your Paycheck 💰",
      description: "Add your income source - this money will be available to allocate to envelopes.",
      target: "[data-tour='add-paycheck']",
      position: "bottom",
      action: () => startTutorialStep("firstPaycheck"),
    },
    {
      id: "create-envelope",
      title: "Create Budget Envelopes 📮",
      description: "Create categories (envelopes) for your money like groceries, rent, savings.",
      target: "[data-tour='add-envelope']",
      position: "bottom",
      action: () => startTutorialStep("firstEnvelope"),
    },
    {
      id: "link-bills",
      title: "Link Bills to Envelopes 🔗",
      description: "Connect your bills to envelopes so they're automatically budgeted for.",
      target: "[data-tour='envelope-grid']",
      position: "top",
      action: () => startTutorialStep("linkedEnvelopes"),
    },
    {
      id: "allocate-money",
      title: "Allocate Your Money 📊",
      description: "Assign money from your paycheck to different envelopes based on your priorities.",
      target: "[data-tour='envelope-grid']",
      position: "top",
      action: () => startTutorialStep("firstAllocation"),
    },
    {
      id: "track-spending",
      title: "Track Your Spending 💳",
      description: "Add transactions to see where your money goes and keep envelopes accurate.",
      target: "[data-tour='add-transaction']",
      position: "bottom",
      action: () => startTutorialStep("firstTransaction"),
    },
    {
      id: "sync-benefits",
      title: "Sync Across Devices 🔄",
      description: "Your data syncs automatically across all your devices so you always have access.",
      target: "[data-tour='sync-indicator']",
      position: "bottom",
      action: () => startTutorialStep("syncExplained"),
    },
  ];

  // Show tutorial for new users
  useEffect(() => {
    if (!isOnboarded && preferences.showHints && !preferences.tourCompleted) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        logger.info("🎯 Starting onboarding tutorial");
      }, 1000); // Small delay to let the UI settle

      return () => clearTimeout(timer);
    }
  }, [isOnboarded, preferences]);

  // Handle escape key to close tutorial
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showTutorial) {
        closeTutorial();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showTutorial]);

  const closeTutorial = () => {
    setShowTutorial(false);
    endTutorialStep();
    setPreference("tourCompleted", true);
    logger.info("🏁 Tutorial closed by user");
  };

  const nextStep = () => {
    const step = tutorialSteps[currentStep];
    if (step?.action) {
      step.action();
    }

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      markStepComplete("accountSetup");
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setPreference("showHints", false);
    closeTutorial();
  };

  const getCurrentStepElement = () => {
    const step = tutorialSteps[currentStep];
    if (!step?.target) return null;
    
    return document.querySelector(step.target);
  };

  const getTooltipPosition = () => {
    const element = getCurrentStepElement();
    const step = tutorialSteps[currentStep];
    
    if (!element || step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = element.getBoundingClientRect();
    const position = step.position || "bottom";

    switch (position) {
      case "top":
        return {
          top: rect.top - 10,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 10,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: "translate(0, -50%)",
        };
      default:
        return {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, 0)",
        };
    }
  };

  const highlightElement = () => {
    const element = getCurrentStepElement();
    if (element) {
      element.style.position = "relative";
      element.style.zIndex = "1001";
      element.style.border = "2px solid #a855f7";
      element.style.borderRadius = "8px";
      element.style.boxShadow = "0 0 0 4px rgba(168, 85, 247, 0.2)";
    }
  };

  const removeHighlight = () => {
    const element = getCurrentStepElement();
    if (element) {
      element.style.position = "";
      element.style.zIndex = "";
      element.style.border = "";
      element.style.borderRadius = "";
      element.style.boxShadow = "";
    }
  };

  // Highlight current element
  useEffect(() => {
    if (showTutorial) {
      highlightElement();
      return () => removeHighlight();
    }
  }, [currentStep, showTutorial]);

  if (!showTutorial || isOnboarded) {
    return children;
  }

  const step = tutorialSteps[currentStep];
  const progress = getProgress();

  return (
    <>
      {children}
      
      {/* Tutorial Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-1000 flex items-center justify-center"
        style={{ zIndex: 1000 }}
      >
        {/* Tutorial Tooltip */}
        <div
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={closeTutorial}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Close tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
              }}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                onClick={skipTutorial}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Skip Tour
              </button>
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <span>
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </span>
              {currentStep === tutorialSteps.length - 1 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTutorial;