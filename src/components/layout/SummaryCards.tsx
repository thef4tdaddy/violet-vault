import React, { lazy, Suspense, memo } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { usePrompt } from "@/hooks/common/usePrompt";
import { useActualBalance } from "@/hooks/budgeting/useBudgetMetadata";
import { useUnassignedCash } from "@/hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useSavingsGoals } from "@/hooks/common/useSavingsGoals";
const UnassignedCashModal = lazy(() => import("../modals/UnassignedCashModal"));
import {
  calculateEnvelopeData,
  calculateEnvelopeTotals,
} from "@/utils/budgeting/envelopeCalculations";

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  clickable: boolean;
  isNegative: boolean;
  subtitle?: string;
  dataTour?: string;
}

/**
 * Summary cards component showing financial overview
 * Now uses TanStack Query hooks for data loading
 */
const SummaryCards = () => {
  const openUnassignedCashModal = useBudgetStore(
    (state) => state.openUnassignedCashModal
  ) as () => void;
  const { unassignedCash } = useUnassignedCash();
  const { actualBalance, updateActualBalance } = useActualBalance();
  const prompt = usePrompt();

  // Get data from TanStack Query hooks (same pattern as Dashboard)
  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const { savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();

  // Calculate totals from hook data
  const totalEnvelopeBalance = envelopes.reduce((sum, env) => sum + (env.currentBalance || 0), 0);
  const totalSavingsBalance = savingsGoals.reduce(
    (sum, goal) => sum + (typeof goal.currentAmount === 'number' ? goal.currentAmount : 0),
    0
  );
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  // Removed noisy debug log - component renders frequently

  // Calculate biweekly needs using existing utility
  const processedEnvelopeData = calculateEnvelopeData(envelopes, [], []);
  const envelopeSummary = calculateEnvelopeTotals(processedEnvelopeData);
  const biweeklyRemaining = envelopeSummary.totalBiweeklyNeed;
  const biweeklyTotal = envelopeSummary.totalBiweeklyNeed; // For now, use same value - can be refined later

  // Show loading state while data is being fetched
  if (envelopesLoading || savingsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glassmorphism rounded-3xl p-6 animate-pulse border border-white/20 ring-1 ring-gray-800/10"
          >
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="bg-gray-300 p-3 rounded-2xl w-12 h-12"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handler for setting actual balance
  const handleSetActualBalance = async () => {
    const newBalance = await prompt({
      title: "Set Actual Balance",
      message: "Enter your current bank account balance:",
      defaultValue: actualBalance?.toString() || "0",
      inputType: "number",
      placeholder: "0.00",
      validation: (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { valid: false, error: "Please enter a valid number" };
        }
        return { valid: true };
      },
    });

    if (newBalance !== null) {
      await updateActualBalance(parseFloat(newBalance as string), {
        isManual: true,
        author: "User",
      });
    }
  };

  const cards = [
    {
      key: "total-cash",
      icon: getIcon("Wallet"),
      label: "Total Cash",
      value: totalCash,
      color: "purple",
      onClick: handleSetActualBalance,
      clickable: true,
    },
    {
      key: "unassigned-cash",
      icon: getIcon("TrendingUp"),
      label: "Unassigned Cash",
      value: unassignedCash,
      color: unassignedCash < 0 ? "red" : "emerald",
      onClick: openUnassignedCashModal, // Always allow clicking to distribute/address negative balance
      clickable: true,
      isNegative: unassignedCash < 0,
    },
    {
      key: "savings-total",
      icon: getIcon("Target"),
      label: "Savings Total",
      value: totalSavingsBalance,
      color: "cyan",
    },
    {
      key: "biweekly-remaining",
      icon: getIcon("DollarSign"),
      label: "Biweekly Remaining",
      value: biweeklyRemaining,
      color: "amber",
      subtitle: `Total allocation: ${biweeklyTotal.toFixed(2)}`,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card) => (
          <SummaryCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={card.value}
            color={card.color}
            onClick={card.onClick}
            clickable={card.clickable}
            isNegative={card.isNegative}
            subtitle={card.subtitle}
            dataTour={card.key === "total-cash" ? "actual-balance" : undefined}
          />
        ))}
      </div>

      <Suspense fallback={null}>
        <UnassignedCashModal />
      </Suspense>
    </>
  );
};

const SummaryCard = memo(
  ({
    icon: _Icon,
    label,
    value,
    color,
    onClick,
    clickable,
    isNegative,
    subtitle,
    dataTour,
  }: SummaryCardProps) => {
    const colorClasses = {
      purple: "bg-purple-500",
      emerald: "bg-emerald-500",
      cyan: "bg-cyan-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
    };

    const textColorClasses = {
      purple: "text-gray-900",
      emerald: "text-emerald-600",
      cyan: "text-cyan-600",
      amber: "text-amber-600",
      red: "text-red-600",
    };

    const baseClasses =
      "glassmorphism rounded-3xl p-6 transition-all duration-200 border border-white/20 ring-1 ring-gray-800/10";
    const clickableClasses = clickable
      ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      : "";

    const cardContent = (
      <div className="flex items-center">
        <div className="relative mr-4">
          <div
            className={`absolute inset-0 ${colorClasses[color]} rounded-2xl blur-lg opacity-30`}
          ></div>
          <div className={`relative ${colorClasses[color]} p-3 rounded-2xl`}>
            <_Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {label}
            {clickable && !isNegative && (
              <span className="ml-1 text-xs text-gray-400">(click to distribute)</span>
            )}
            {isNegative && (
              <span className="ml-1 text-xs text-red-500">(overspending - click to address)</span>
            )}
          </p>
          <p
            className={`text-2xl font-bold ${textColorClasses[color]} ${isNegative ? "animate-pulse" : ""}`}
          >
            ${value.toFixed(2)}
            {isNegative && <span className="ml-2 text-sm">⚠️</span>}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );

    return clickable ? (
      <Button
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses} text-left w-full`}
        disabled={!onClick}
        data-tour={dataTour}
      >
        {cardContent}
      </Button>
    ) : (
      <div className={baseClasses} data-tour={dataTour}>
        {cardContent}
      </div>
    );
  }
);

export default memo(SummaryCards);
