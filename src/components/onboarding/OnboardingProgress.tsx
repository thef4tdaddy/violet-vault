import React, { useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useOnboardingStore from "../../stores/ui/onboardingStore";
import { useShallow } from "zustand/react/shallow";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
}

interface TutorialProgress {
  accountSetup: boolean;
  firstBankBalance: boolean;
  firstDebts: boolean;
  firstBills: boolean;
  firstPaycheck: boolean;
  firstEnvelope: boolean;
  linkedEnvelopes: boolean;
  firstAllocation: boolean;
  firstTransaction: boolean;
  syncExplained: boolean;
}

interface OnboardingPreferences {
  showHints: boolean;
  tourCompleted: boolean;
}

interface OnboardingProgressData {
  completed: number;
  total: number;
  percentage: number;
}

interface OnboardingStoreState {
  isOnboarded: boolean;
  tutorialProgress: TutorialProgress;
  getProgress: () => OnboardingProgressData;
  preferences: OnboardingPreferences;
  setPreference: (key: keyof OnboardingPreferences, value: boolean) => void;
}

/**
 * OnboardingProgress - Shows progress checklist for new users
 */
const OnboardingProgress = () => {
  const { isOnboarded, tutorialProgress, getProgress, preferences, setPreference } =
    useOnboardingStore(
      useShallow((state) => ({
        isOnboarded: (state as OnboardingStoreState).isOnboarded,
        tutorialProgress: (state as OnboardingStoreState).tutorialProgress,
        getProgress: (state as OnboardingStoreState).getProgress,
        preferences: (state as OnboardingStoreState).preferences,
        setPreference: (state as OnboardingStoreState).setPreference,
      }))
    );

  const [isExpanded, setIsExpanded] = useState(!isOnboarded);

  // Don't show if user has disabled hints or is fully onboarded
  if (!preferences.showHints || isOnboarded) {
    return null;
  }

  const progress = getProgress();

  const steps: OnboardingStep[] = [
    {
      id: "accountSetup",
      title: "Account Setup",
      description: "Create your VioletVault account",
      completed: tutorialProgress.accountSetup,
      category: "Setup",
    },
    {
      id: "firstBankBalance",
      title: "Set Your Bank Balance",
      description: "Enter your current account balance",
      completed: tutorialProgress.firstBankBalance,
      category: "Financial Basics",
    },
    {
      id: "firstDebts",
      title: "Add Your Debts (Optional)",
      description: "Track credit cards, loans, and other debts",
      completed: tutorialProgress.firstDebts,
      category: "Financial Basics",
    },
    {
      id: "firstBills",
      title: "Set Up Bills (Optional)",
      description: "Add recurring expenses like rent, utilities",
      completed: tutorialProgress.firstBills,
      category: "Financial Basics",
    },
    {
      id: "firstPaycheck",
      title: "Add Your Paycheck",
      description: "Set up your income source",
      completed: tutorialProgress.firstPaycheck,
      category: "Income",
    },
    {
      id: "firstEnvelope",
      title: "Create Budget Categories",
      description: "Add envelopes for different expenses",
      completed: tutorialProgress.firstEnvelope,
      category: "Budgeting",
    },
    {
      id: "linkedEnvelopes",
      title: "Link Bills to Envelopes",
      description: "Connect bills to budget categories automatically",
      completed: tutorialProgress.linkedEnvelopes,
      category: "Budgeting",
    },
    {
      id: "firstAllocation",
      title: "Allocate Your Money",
      description: "Distribute income to envelopes",
      completed: tutorialProgress.firstAllocation,
      category: "Budgeting",
    },
    {
      id: "firstTransaction",
      title: "Track Your First Expense",
      description: "Record a spending transaction",
      completed: tutorialProgress.firstTransaction,
      category: "Tracking",
    },
    {
      id: "syncExplained",
      title: "Understand Sync",
      description: "Learn about cross-device synchronization",
      completed: tutorialProgress.syncExplained,
      category: "Features",
    },
  ];

  const handleDismiss = () => {
    setPreference("showHints", false);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {React.createElement(getIcon("Trophy"), {
              className: "w-5 h-5 text-purple-500",
            })}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h3>
          </div>

          {progress.percentage > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {progress.completed}/{progress.total}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {progress.percentage === 100 && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Complete!
            </span>
          )}
          <Button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={isExpanded ? "Collapse onboarding progress" : "Expand onboarding progress"}
          >
            {isExpanded
              ? React.createElement(getIcon("ChevronUp"), {
                  className: "w-5 h-5",
                })
              : React.createElement(getIcon("ChevronDown"), {
                  className: "w-5 h-5",
                })}
          </Button>
        </div>
      </div>

      {/* Progress Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Complete these steps to get the most out of VioletVault:
          </p>

          {/* Steps List - Grouped by Category */}
          <div className="space-y-4">
            {/* Group steps by category */}
            {Object.entries(
              steps.reduce<Record<string, OnboardingStep[]>>((groups, step) => {
                const category = step.category || "Other";
                if (!groups[category]) groups[category] = [];
                groups[category].push(step);
                return groups;
              }, {})
            ).map(([category, categorySteps]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  {category}
                </h4>

                {categorySteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                      step.completed
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.completed
                        ? React.createElement(getIcon("CheckCircle"), {
                            className: "w-5 h-5 text-green-500",
                          })
                        : React.createElement(getIcon("Circle"), {
                            className: "w-5 h-5 text-gray-400",
                          })}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5
                        className={`text-sm font-medium ${
                          step.completed
                            ? "text-green-800 dark:text-green-200"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {step.title}
                      </h5>
                      <p
                        className={`text-xs ${
                          step.completed
                            ? "text-green-600 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>

                    {step.completed && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Done
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-purple-200 dark:border-purple-700">
            <div className="flex space-x-2">
              <Button
                onClick={handleDismiss}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Dismiss this guide
              </Button>
              <Button
                onClick={() => setPreference("tourCompleted", false)}
                className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Restart Tutorial
              </Button>
            </div>

            {progress.percentage === 100 && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                {React.createElement(getIcon("Trophy"), {
                  className: "w-4 h-4",
                })}
                <span className="text-sm font-medium">Congratulations! Setup complete!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
