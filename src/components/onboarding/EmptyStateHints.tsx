import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import useOnboardingStore from "../../stores/ui/onboardingStore";
import { useShallow } from "zustand/react/shallow";

interface HintConfig {
  icon: string;
  title: string;
  message: string;
  actions: (
    onAction: () => void,
    markStepComplete: (step: string) => void
  ) => Array<{
    label: string;
    onClick: () => void;
    primary: boolean;
  }>;
  step: string;
  color: string;
}

interface CustomMessage {
  title?: string;
  description?: string;
}

interface CustomAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface EmptyStateHintsProps {
  type: keyof typeof HINT_CONFIGS;
  onAction: () => void;
  customMessage?: CustomMessage;
  customActions?: CustomAction[];
}

// Hint configurations for different empty states
const HINT_CONFIGS: Record<string, HintConfig> = {
  bankBalance: {
    icon: "Wallet",
    title: "Set Your Bank Balance",
    message:
      "Start by entering your current actual bank account balance. This helps you track your real money.",
    actions: (onAction, _markStepComplete) => [
      {
        label: "Set Bank Balance",
        onClick: onAction,
        primary: true,
      },
    ],
    step: "firstBankBalance",
    color: "blue",
  },

  debts: {
    icon: "CreditCard",
    title: "Track Your Debts",
    message: "Add credit cards, loans, and other debts to get a complete picture of your finances.",
    actions: (onAction, markStepComplete) => [
      {
        label: "Add Debt",
        onClick: onAction,
        primary: true,
      },
      {
        label: "Skip for Now",
        onClick: () => markStepComplete("firstDebts"),
        primary: false,
      },
    ],
    step: "firstDebts",
    color: "red",
  },

  bills: {
    icon: "Calendar",
    title: "Set Up Recurring Bills",
    message: "Add bills like rent, utilities, and subscriptions to plan for upcoming expenses.",
    actions: (onAction, markStepComplete) => [
      {
        label: "Add Bill",
        onClick: onAction,
        primary: true,
      },
      {
        label: "Skip for Now",
        onClick: () => markStepComplete("firstBills"),
        primary: false,
      },
    ],
    step: "firstBills",
    color: "orange",
  },

  paycheck: {
    icon: "DollarSign",
    title: "Add Your First Paycheck",
    message:
      "Your paycheck is the foundation of envelope budgeting. Add your income to get started.",
    actions: (onAction, _markStepComplete) => [
      {
        label: "Add Paycheck",
        onClick: onAction,
        primary: true,
      },
    ],
    step: "firstPaycheck",
    color: "green",
  },

  envelopes: {
    icon: "PlusCircle",
    title: "Create Your First Envelope",
    message:
      "Envelopes are budget categories like groceries, rent, or savings. Create one to start organizing your money.",
    actions: (onAction, _markStepComplete) => [
      {
        label: "Create Envelope",
        onClick: onAction,
        primary: true,
      },
    ],
    step: "firstEnvelope",
    color: "purple",
  },

  transactions: {
    icon: "ArrowRight",
    title: "Track Your First Expense",
    message:
      "Record spending to see where your money goes and keep your envelope balances accurate.",
    actions: (onAction, _markStepComplete) => [
      {
        label: "Add Transaction",
        onClick: onAction,
        primary: true,
      },
    ],
    step: "firstTransaction",
    color: "indigo",
  },

  linkedEnvelopes: {
    icon: "ArrowRight",
    title: "Link Bills to Envelopes",
    message:
      "Connect your bills to envelopes so the amounts are automatically budgeted for each month.",
    actions: (onAction, markStepComplete) => [
      {
        label: "Link Bills",
        onClick: onAction,
        primary: true,
      },
      {
        label: "Skip for Now",
        onClick: () => markStepComplete("linkedEnvelopes"),
        primary: false,
      },
    ],
    step: "linkedEnvelopes",
    color: "teal",
  },
};

// Color classes for hint UI
const COLOR_CLASSES = {
  blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
  red: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
  orange:
    "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300",
  green:
    "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300",
  purple:
    "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300",
  indigo:
    "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300",
  teal: "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300",
};

// Button color classes for hint actions
const BUTTON_COLOR_CLASSES = {
  blue: "bg-blue-500 hover:bg-blue-600 text-blue-700 hover:text-blue-800",
  red: "bg-red-500 hover:bg-red-600 text-red-700 hover:text-red-800",
  orange: "bg-orange-500 hover:bg-orange-600 text-orange-700 hover:text-orange-800",
  green: "bg-green-500 hover:bg-green-600 text-green-700 hover:text-green-800",
  purple: "bg-purple-500 hover:bg-purple-600 text-purple-700 hover:text-purple-800",
  indigo: "bg-indigo-500 hover:bg-indigo-600 text-indigo-700 hover:text-indigo-800",
  teal: "bg-teal-500 hover:bg-teal-600 text-teal-700 hover:text-teal-800",
};

/**
 * EmptyStateHints - Provides contextual hints and guidance for empty states
 */
const EmptyStateHints = ({
  type,
  onAction,
  customMessage,
  customActions,
}: EmptyStateHintsProps) => {
  const { shouldShowHint, markStepComplete, preferences } = useOnboardingStore(
    useShallow((state) => ({
      shouldShowHint: state.shouldShowHint,
      markStepComplete: state.markStepComplete,
      preferences: state.preferences,
    }))
  );

  // Don't show hints if user has disabled them
  if (!preferences.showHints) {
    return null;
  }

  const config = HINT_CONFIGS[type];
  if (!config) {
    return null;
  }

  // Only show hint if this step is not completed yet
  if (!shouldShowHint(config.step)) {
    return null;
  }

  return (
    <div className={`border rounded-lg p-6 ${COLOR_CLASSES[config.color]}`}>
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm">
            {React.createElement(getIcon(config.icon), {
              className: `w-5 h-5 text-${config.color}-500`,
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {React.createElement(getIcon("Lightbulb"), {
              className: "w-4 h-4",
            })}
            <h3 className="text-lg font-semibold">{customMessage?.title || config.title}</h3>
          </div>

          <p className="text-sm mb-4">{customMessage?.description || config.message}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {(customActions || config.actions(onAction, markStepComplete)).map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.primary
                    ? `text-white ${BUTTON_COLOR_CLASSES[config.color]}`
                    : `text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`
                }`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateHints;
