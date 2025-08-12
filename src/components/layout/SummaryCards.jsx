import React, { memo, lazy, Suspense } from "react";
import { DollarSign, Wallet, Target, TrendingUp } from "lucide-react";
import { useBudgetStore } from "../../stores/budgetStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useSavingsGoals } from "../../hooks/useSavingsGoals";
const UnassignedCashModal = lazy(() => import("../modals/UnassignedCashModal"));
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";

/**
 * Summary cards component showing financial overview
 * Now uses TanStack Query hooks for data loading
 */
const SummaryCards = () => {
  const budgetStore = useBudgetStore();
  const { openUnassignedCashModal, unassignedCash } = budgetStore;

  // Get data from TanStack Query hooks
  const { data: queryEnvelopes = [], isLoading: envelopesLoading } =
    useEnvelopes();
  const { data: querySavingsGoals = [], isLoading: savingsLoading } =
    useSavingsGoals();

  // Fallback to Zustand data if TanStack Query data is empty (like Dashboard does)
  const envelopes =
    queryEnvelopes.length > 0 ? queryEnvelopes : budgetStore.envelopes || [];
  const savingsGoals =
    querySavingsGoals.length > 0
      ? querySavingsGoals
      : budgetStore.savingsGoals || [];

  // Calculate totals from hook data
  const totalEnvelopeBalance = envelopes.reduce(
    (sum, env) => sum + (env.currentBalance || 0),
    0,
  );
  const totalSavingsBalance = savingsGoals.reduce(
    (sum, goal) => sum + (goal.currentAmount || 0),
    0,
  );
  const totalCash = totalEnvelopeBalance + totalSavingsBalance + unassignedCash;

  // Debug logging to compare with Dashboard
  console.log("🔍 SummaryCards Debug:", {
    queryEnvelopesCount: queryEnvelopes.length,
    zustandEnvelopesCount: budgetStore.envelopes?.length || 0,
    usingQuery: queryEnvelopes.length > 0,
    finalEnvelopesCount: envelopes.length,
    totalEnvelopeBalance,
    totalSavingsBalance,
    unassignedCash,
    totalCash,
    firstEnvelope: envelopes[0],
  });

  // Calculate total biweekly funding need
  const biweeklyAllocation = envelopes.reduce((sum, env) => {
    const envelopeType =
      env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

    let biweeklyNeed = 0;
    if (envelopeType === "bill" && env.biweeklyAllocation) {
      biweeklyNeed = Math.max(
        0,
        env.biweeklyAllocation - (env.currentBalance || 0),
      );
    } else if (envelopeType === "variable" && env.monthlyBudget) {
      const biweeklyTarget = env.monthlyBudget / BIWEEKLY_MULTIPLIER;
      biweeklyNeed = Math.max(0, biweeklyTarget - (env.currentBalance || 0));
    } else if (envelopeType === "savings" && env.targetAmount) {
      const remainingToTarget = Math.max(
        0,
        env.targetAmount - (env.currentBalance || 0),
      );
      biweeklyNeed = Math.min(remainingToTarget, env.biweeklyAllocation || 0);
    }

    return sum + biweeklyNeed;
  }, 0);

  // Show loading state while data is being fetched
  if (envelopesLoading || savingsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glassmorphism rounded-3xl p-6 animate-pulse">
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

  const cards = [
    {
      key: "total-cash",
      icon: Wallet,
      label: "Total Cash",
      value: totalCash,
      color: "purple",
    },
    {
      key: "unassigned-cash",
      icon: TrendingUp,
      label: "Unassigned Cash",
      value: unassignedCash,
      color: unassignedCash < 0 ? "red" : "emerald",
      onClick: openUnassignedCashModal, // Always allow clicking to distribute/address negative balance
      clickable: true,
      isNegative: unassignedCash < 0,
    },
    {
      key: "savings-total",
      icon: Target,
      label: "Savings Total",
      value: totalSavingsBalance,
      color: "cyan",
    },
    {
      key: "biweekly-need",
      icon: DollarSign,
      label: "Biweekly Need",
      value: biweeklyAllocation,
      color: "amber",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
  // eslint-disable-next-line no-unused-vars
  ({ icon: _Icon, label, value, color, onClick, clickable, isNegative }) => {
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
      "glassmorphism rounded-3xl p-6 transition-all duration-200";
    const clickableClasses = clickable
      ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
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
              <span className="ml-1 text-xs text-gray-400">
                (click to distribute)
              </span>
            )}
            {isNegative && (
              <span className="ml-1 text-xs text-red-500">
                (overspending - click to address)
              </span>
            )}
          </p>
          <p
            className={`text-2xl font-bold ${textColorClasses[color]} ${isNegative ? "animate-pulse" : ""}`}
          >
            ${value.toFixed(2)}
            {isNegative && <span className="ml-2 text-sm">⚠️</span>}
          </p>
        </div>
      </div>
    );

    return clickable ? (
      <button
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses} text-left w-full`}
        disabled={!onClick}
      >
        {cardContent}
      </button>
    ) : (
      <div className={baseClasses}>{cardContent}</div>
    );
  },
);

export default memo(SummaryCards);
