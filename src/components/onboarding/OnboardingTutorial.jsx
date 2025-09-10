import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getIcon } from "../../utils/icons";
import useOnboardingStore from "../../stores/ui/onboardingStore";
import logger from "../../utils/common/logger";

/**
 * OnboardingTutorial - Provides guided tours and contextual hints for new users
 */
const OnboardingTutorial = ({ children }) => {
  const navigate = useNavigate();
  const {
    isOnboarded,
    // currentTutorialStep, // Available for future use
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
      description:
        "Let's take a quick tour to get you started with envelope budgeting and personal finance tracking.",
      target: null,
      position: "center",
      action: () => logger.info("Welcome step shown"),
    },
    {
      id: "set-bank-balance",
      title: "Set Your Bank Balance 🏦",
      description:
        "Click on your Total Cash card to set your actual bank account balance so we can track your real money.",
      target: "[data-tour='actual-balance']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstBankBalance");
        // The Total Cash card should be clickable to open balance modal
      },
    },
    {
      id: "add-debts",
      title: "Add Your Debts (Optional) 💳",
      description:
        "Click on the Debts tab to add credit cards, loans, and other debts. You can track balances and payoff progress.",
      target: "[data-tab='debts']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstDebts");
        navigate("/debts");
      },
    },
    {
      id: "add-bills",
      title: "Set Up Recurring Bills (Optional) 📋",
      description:
        "Click on the Bills tab to add recurring expenses like rent and utilities. These will help with automated budgeting.",
      target: "[data-tab='bills']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstBills");
        navigate("/bills");
      },
    },
    {
      id: "add-paycheck",
      title: "Add Your Paycheck 💰",
      description:
        "Click on the Paycheck tab to set up your income sources and funding schedule.",
      target: "[data-tab='paycheck']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstPaycheck");
        navigate("/paycheck");
      },
    },
    {
      id: "create-envelope",
      title: "Create Budget Envelopes 📮",
      description:
        "Click on the Envelopes tab to create categories for your money like groceries, rent, and savings.",
      target: "[data-tab='envelopes']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstEnvelope");
        navigate("/envelopes");
      },
    },
    {
      id: "link-bills",
      title: "Link Bills to Envelopes 🔗",
      description:
        "Connect your bills to envelopes so they're automatically budgeted for.",
      target: "[data-tour='envelope-grid']",
      position: "top",
      action: () => startTutorialStep("linkedEnvelopes"),
    },
    {
      id: "allocate-money",
      title: "Allocate Your Money 📊",
      description:
        "Assign money from your paycheck to different envelopes based on your priorities.",
      target: "[data-tour='envelope-grid']",
      position: "top",
      action: () => startTutorialStep("firstAllocation"),
    },
    {
      id: "track-spending",
      title: "Track Your Spending 💳",
      description:
        "Click on the Transactions tab to track where your money goes and manage your spending history.",
      target: "[data-tab='transactions']",
      position: "bottom",
      action: () => {
        startTutorialStep("firstTransaction");
        navigate("/transactions");
      },
    },
    {
      id: "sync-benefits",
      title: "Sync Across Devices 🔄",
      description:
        "Your data syncs automatically across all your devices so you always have access.",
      target: "[data-tour='sync-indicator']",
      position: "bottom",
      action: () => startTutorialStep("syncExplained"),
    },
  ];

  // Show tutorial for new users
  useEffect(() => {
    if (!isOnboarded && preferences.showHints && !preferences.tourCompleted) {
      // For truly new accounts, be more aggressive about showing tutorial
      const progress = getProgress();
      const isTrulyNew = progress.completed === 0;

      const delay = isTrulyNew ? 500 : 1000; // Shorter delay for new accounts

      const timer = setTimeout(() => {
        setShowTutorial(true);
        logger.info("🎯 Starting onboarding tutorial", {
          progress: progress.completed,
          isTrulyNew,
          delay,
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOnboarded, preferences, getProgress]);

  const closeTutorial = () => {
    setShowTutorial(false);
    endTutorialStep();
    setPreference("tourCompleted", true);
    logger.info("🏁 Tutorial closed by user");
  };

  // Handle escape key to close tutorial
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showTutorial) {
        closeTutorial();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showTutorial, closeTutorial]);

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
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate base position
    let top, left, transform;

    switch (position) {
      case "top":
        top = rect.top - 10;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, -100%)";
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, 0)";
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
        transform = "translate(-100%, -50%)";
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        transform = "translate(0, -50%)";
        break;
      default:
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, 0)";
    }

    // Ensure tooltip stays within viewport bounds
    const tooltipWidth = 384; // max-w-md (24rem = 384px)
    const tooltipHeight = 300; // Estimated tooltip height

    // Adjust horizontal position if too close to edges
    if (left - tooltipWidth / 2 < 20) {
      left = tooltipWidth / 2 + 20;
      transform = transform.replace("translate(-50%", "translate(-50%");
    } else if (left + tooltipWidth / 2 > viewportWidth - 20) {
      left = viewportWidth - tooltipWidth / 2 - 20;
      transform = transform.replace("translate(-50%", "translate(-50%");
    }

    // Adjust vertical position if too close to edges
    if (top < 20) {
      top = 20;
      if (position === "top") {
        transform = transform
          .replace("translate(", "translate(")
          .replace("-100%)", "0%)");
      }
    } else if (top + tooltipHeight > viewportHeight - 20) {
      top = viewportHeight - tooltipHeight - 20;
      if (position === "bottom") {
        transform = transform
          .replace("translate(", "translate(")
          .replace("0%)", "-100%)");
      }
    }

    return { top, left, transform };
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
  }, [currentStep, showTutorial, highlightElement, removeHighlight]);

  if (!showTutorial || isOnboarded) {
    return children;
  }

  const step = tutorialSteps[currentStep];
  // const progress = getProgress(); // Available for future progress indicators

  return (
    <>
      {children}

      {/* Tutorial Overlay with Spotlight Effect */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-1000"
        style={{
          zIndex: 1000,
          background: getCurrentStepElement()
            ? (() => {
                const rect = getCurrentStepElement().getBoundingClientRect();
                const padding = 8;
                return `
                  radial-gradient(ellipse at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
                    transparent ${Math.max(rect.width, rect.height) / 2 + padding}px, 
                    rgba(0,0,0,0.7) ${Math.max(rect.width, rect.height) / 2 + padding + 20}px)
                `;
              })()
            : "rgba(0,0,0,0.5)",
        }}
      >
        {/* Tutorial Tooltip */}
        <div
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              {React.createElement(getIcon("Target"), {
                className: "w-5 h-5 text-purple-500",
              })}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={closeTutorial}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Close tutorial"
            >
              {React.createElement(getIcon("X"), { className: "w-5 h-5" })}
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
                {React.createElement(getIcon("ChevronLeft"), {
                  className: "w-4 h-4",
                })}
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
              {currentStep === tutorialSteps.length - 1
                ? React.createElement(getIcon("CheckCircle"), {
                    className: "w-4 h-4",
                  })
                : React.createElement(getIcon("ChevronRight"), {
                    className: "w-4 h-4",
                  })}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTutorial;
