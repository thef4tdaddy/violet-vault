import React from "react";
import { getIcon } from "@/utils";
import { Button, StylizedButtonText } from "@/components/ui";

/**
 * Account card type
 */
export type AccountCardType = "checking" | "savings" | "unassigned";

/**
 * Props for AccountCard component
 */
export interface AccountCardProps {
  /** Type of account card */
  type: AccountCardType;
  /** Current balance amount */
  balance: number;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Warning/alert state (for negative or high unassigned) */
  isWarning?: boolean;
}

/**
 * Get card configuration based on type
 */
const getCardConfig = (type: AccountCardType, isWarning: boolean) => {
  const configs = {
    checking: {
      icon: "CreditCard",
      title: "Checking Account",
      gradientFrom: "from-blue-50",
      gradientTo: "to-blue-100",
      borderColor: "border-blue-200",
      borderHoverColor: "hover:border-blue-400",
      iconColor: "text-blue-600",
      balanceColor: "text-blue-900",
    },
    savings: {
      icon: "PiggyBank",
      title: "Savings Account",
      gradientFrom: "from-green-50",
      gradientTo: "to-green-100",
      borderColor: "border-green-200",
      borderHoverColor: "hover:border-green-400",
      iconColor: "text-green-600",
      balanceColor: "text-green-900",
    },
    unassigned: {
      icon: "DollarSign",
      title: "Unassigned Cash",
      gradientFrom: isWarning ? "from-purple-50" : "from-gray-50",
      gradientTo: isWarning ? "to-purple-100" : "to-gray-100",
      borderColor: isWarning ? "border-purple-300" : "border-gray-200",
      borderHoverColor: isWarning ? "hover:border-purple-500" : "hover:border-gray-400",
      iconColor: isWarning ? "text-purple-600" : "text-gray-600",
      balanceColor: isWarning ? "text-purple-900" : "text-gray-900",
    },
  };

  return configs[type];
};

/**
 * Loading skeleton for AccountCard
 */
const AccountCardSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl shadow-xl p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-24"></div>
  </div>
);

/**
 * Individual glassmorphic account card component
 *
 * Features:
 * - Glassmorphism styling with backdrop blur
 * - v2.0 ALL CAPS typography with large first letter
 * - Hover effects and micro-animations
 * - Optional action button
 * - Loading skeleton state
 * - Warning state for negative/high balances
 *
 * @example
 * ```tsx
 * <AccountCard
 *   type="checking"
 *   balance={2500.50}
 *   subtitle="5 recent transactions"
 * />
 * ```
 */
export const AccountCard: React.FC<AccountCardProps> = ({
  type,
  balance,
  subtitle,
  action,
  isLoading = false,
  isWarning = false,
}) => {
  if (isLoading) {
    return <AccountCardSkeleton />;
  }

  const config = getCardConfig(type, isWarning);

  // Format balance with proper styling
  const isNegative = balance < 0;
  const displayBalance = Math.abs(balance).toFixed(2);
  const balanceColor = isNegative
    ? "text-red-600"
    : config.balanceColor;

  return (
    <div
      className={`
        bg-white/90 backdrop-blur-sm 
        border-2 border-black 
        rounded-xl shadow-xl 
        hover:shadow-2xl 
        transition-all duration-300
        p-6
        group
        bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo}
      `}
      data-testid={`account-card-${type}`}
    >
      {/* Header with icon */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-black text-black text-base flex items-center">
            <StylizedButtonText firstLetterClassName="text-lg" restClassName="text-base">
              {config.title.toUpperCase()}
            </StylizedButtonText>
          </h3>
        </div>
        {React.createElement(getIcon(config.icon), {
          className: `h-6 w-6 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`,
        })}
      </div>

      {/* Balance display */}
      <div className="mb-4">
        <div className={`text-4xl font-bold ${balanceColor} transition-all duration-300`}>
          {isNegative && "-"}${displayBalance}
        </div>
        {isNegative && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            {React.createElement(getIcon("AlertTriangle"), {
              className: "h-4 w-4 mr-1",
            })}
            <span>Overspent</span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-sm text-gray-600 mb-4 flex items-center">
          {React.createElement(getIcon("Info"), {
            className: "h-3.5 w-3.5 mr-1.5",
          })}
          {subtitle}
        </div>
      )}

      {/* Action button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
          color="purple"
          size="sm"
          className="w-full mt-2 group-hover:scale-105 transition-transform duration-300"
        >
          {action.icon &&
            React.createElement(getIcon(action.icon), {
              className: "h-4 w-4 mr-2",
            })}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default AccountCard;
