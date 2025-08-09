import React from "react";
import { DollarSign, Wallet, Target, TrendingUp } from "lucide-react";
import { useBudgetStore } from "../../stores/budgetStore";
import UnassignedCashModal from "../modals/UnassignedCashModal";

/**
 * Summary cards component showing financial overview
 * Extracted from Layout.jsx for better organization
 */
const SummaryCards = ({ totalCash, unassignedCash, totalSavingsBalance, biweeklyAllocation }) => {
  const { openUnassignedCashModal } = useBudgetStore();

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
      <UnassignedCashModal />
    </>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color, onClick, clickable, isNegative }) => {
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

  const baseClasses = "glassmorphism rounded-3xl p-6 transition-all duration-200";
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
          <Icon className="h-6 w-6 text-white" />
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
};

export default SummaryCards;
