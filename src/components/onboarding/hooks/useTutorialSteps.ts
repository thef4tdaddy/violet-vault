import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useOnboardingStore from "../../../stores/ui/onboardingStore";
import logger from "@/utils/core/common/logger";
import { TutorialStep, StepPosition } from "./useTutorialPositioning";

export type { TutorialStep, StepPosition };

/**
 * Hook for managing tutorial step configuration and navigation
 * Extracted from OnboardingTutorial.jsx to reduce complexity
 */
export const useTutorialSteps = () => {
  const navigate = useNavigate();
  const startTutorialStep = useOnboardingStore((state) => state.startTutorialStep);

  // Tutorial steps configuration
  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        id: "welcome",
        title: "Welcome to VioletVault! 🎉",
        description:
          "Let's take a quick tour to get you started with envelope budgeting and personal finance tracking.",
        target: null,
        position: "center" as StepPosition,
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
        description: "Connect your bills to envelopes so they're automatically budgeted for.",
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
    ],
    [navigate, startTutorialStep]
  );

  const getCurrentStepElement = useCallback(
    (currentStep: number): HTMLElement | null => {
      const step = tutorialSteps[currentStep];
      if (!step?.target) return null;
      return document.querySelector(step.target) as HTMLElement | null;
    },
    [tutorialSteps]
  );

  return {
    tutorialSteps,
    getCurrentStepElement,
  };
};
