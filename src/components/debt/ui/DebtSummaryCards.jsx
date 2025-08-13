import React from "react";
import { DollarSign, TrendingDown, Percent, AlertTriangle, Calendar } from "lucide-react";

/**
 * Debt overview summary cards
 * Pure UI component for displaying debt statistics
 */
const DebtSummaryCards = ({ stats }) => {
  const cards = [
    {
      key: "total-debt",
      icon: DollarSign,
      label: "Total Debt",
      value: `$${stats.totalDebt.toFixed(2)}`,
      color: "red",
      subtext: `${stats.activeDebtCount} active debts`,
    },
    {
      key: "monthly-payments",
      icon: TrendingDown,
      label: "Monthly Payments",
      value: `$${stats.totalMonthlyPayments.toFixed(2)}`,
      color: "orange",
      subtext: "Required minimum payments",
    },
    {
      key: "average-rate",
      icon: Percent,
      label: "Avg Interest Rate",
      value: `${stats.averageInterestRate.toFixed(2)}%`,
      color: "purple",
      subtext: "Weighted by balance",
    },
    {
      key: "due-soon",
      icon: Calendar,
      label: "Due Soon",
      value: `$${stats.dueSoonAmount.toFixed(2)}`,
      color: "yellow",
      subtext: `${stats.dueSoonCount} payments this week`,
      alert: stats.dueSoonCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <DebtSummaryCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          subtext={card.subtext}
          color={card.color}
          alert={card.alert}
        />
      ))}
    </div>
  );
};

const DebtSummaryCard = ({
  // eslint-disable-next-line no-unused-vars
  icon: _Icon,
  label,
  value,
  subtext,
  color,
  alert,
}) => {
  const colorClasses = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };

  const textColorClasses = {
    red: "text-red-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
  };

  const _bgColorClasses = {
    red: "bg-red-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    amber: "bg-amber-50",
    emerald: "bg-emerald-50",
  };

  return (
    <div
      className={`glassmorphism rounded-3xl p-6 border-2 transition-all duration-200 ${
        alert ? "border-amber-200 bg-amber-50/50" : "border-white/20"
      } hover:shadow-lg`}
    >
      <div className="flex items-center">
        <div className="relative mr-4">
          <div
            className={`absolute inset-0 ${colorClasses[color]} rounded-2xl blur-lg opacity-30`}
          ></div>
          <div className={`relative ${colorClasses[color]} p-3 rounded-2xl`}>
            <_Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
            {alert && <AlertTriangle className="h-3 w-3 ml-2 text-amber-500" />}
          </div>
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

export default DebtSummaryCards;
