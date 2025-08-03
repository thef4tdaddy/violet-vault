import React from "react";
import { DollarSign, Wallet, Target, TrendingUp } from "lucide-react";

/**
 * Summary cards component showing financial overview
 * Extracted from Layout.jsx for better organization
 */
const SummaryCards = ({ totalCash, unassignedCash, totalSavingsBalance, biweeklyAllocation }) => {
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
      color: "emerald",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          color={card.color}
        />
      ))}
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => {
  // Handle negative values with special styling
  const isNegative = value < 0;
  const isUnassignedCash = label === "Unassigned Cash";

  const colorClasses = {
    purple: "bg-purple-500",
    emerald: isNegative && isUnassignedCash ? "bg-red-500" : "bg-emerald-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
  };

  const textColorClasses = {
    purple: "text-gray-900",
    emerald: isNegative && isUnassignedCash ? "text-red-600" : "text-emerald-600",
    cyan: "text-cyan-600",
    amber: "text-amber-600",
  };

  const cardBgClass =
    isNegative && isUnassignedCash
      ? "glassmorphism rounded-3xl p-6 border-2 border-red-200 bg-red-50"
      : "glassmorphism rounded-3xl p-6";

  return (
    <div className={cardBgClass}>
      <div className="flex items-center">
        <div className="relative mr-4">
          <div
            className={`absolute inset-0 ${colorClasses[color]} rounded-2xl blur-lg opacity-30`}
          ></div>
          <div className={`relative ${colorClasses[color]} p-3 rounded-2xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {label}
            {isNegative && isUnassignedCash && <span className="ml-1 text-red-600">⚠️</span>}
          </p>
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>${value.toFixed(2)}</p>
          {isNegative && isUnassignedCash && (
            <p className="text-xs text-red-600 mt-1">Budget deficit</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
