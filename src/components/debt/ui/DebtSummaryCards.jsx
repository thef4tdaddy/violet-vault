import React from "react";
import {
  DollarSign,
  TrendingDown,
  Percent,
  AlertTriangle,
  Calendar,
} from "lucide-react";

/**
 * Debt overview summary cards
 * Pure UI component for displaying debt statistics
 */
const DebtSummaryCards = ({ stats, onDueSoonClick }) => {
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
      onClick: stats.dueSoonCount > 0 ? onDueSoonClick : null,
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
          onClick={card.onClick}
        />
      ))}
    </div>
  );
};

const DebtSummaryCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  alert,
  onClick,
}) => {
  const gradientClasses = {
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    yellow: "from-yellow-500 to-yellow-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  const textClasses = {
    red: "text-red-100",
    orange: "text-orange-100",
    purple: "text-purple-100",
    amber: "text-amber-100",
    yellow: "text-yellow-100",
    emerald: "text-emerald-100",
  };

  const iconClasses = {
    red: "text-red-200",
    orange: "text-orange-200",
    purple: "text-purple-200",
    amber: "text-amber-200",
    yellow: "text-yellow-200",
    emerald: "text-emerald-200",
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradientClasses[color]} p-4 rounded-lg text-white transition-all duration-200 ${
        alert ? "ring-2 ring-white ring-opacity-50" : ""
      } hover:shadow-lg ${onClick ? "cursor-pointer hover:scale-105" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <p className={`${textClasses[color]} text-sm`}>{label}</p>
            {alert && <AlertTriangle className="h-3 w-3 ml-2 text-white" />}
          </div>
          <p className="text-2xl font-bold">{value}</p>
          {subtext && (
            <p className={`text-xs ${textClasses[color]} mt-2`}>{subtext}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${iconClasses[color]}`} />
      </div>
    </div>
  );
};

export default DebtSummaryCards;
