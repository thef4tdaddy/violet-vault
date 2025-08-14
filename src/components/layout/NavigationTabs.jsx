import React, { memo } from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";

/**
 * Navigation tabs component for the main layout
 * Extracted from Layout.jsx for better organization
 */
const NavigationTabs = memo(({ activeView, onViewChange }) => {
  const tabs = [
    {
      key: "dashboard",
      icon: CreditCard,
      label: "Dashboard",
    },
    {
      key: "envelopes",
      icon: Wallet,
      label: "Envelopes",
    },
    {
      key: "savings",
      icon: Target,
      label: "Savings Goals",
    },
    {
      key: "supplemental",
      icon: CreditCard,
      label: "Supplemental",
    },
    {
      key: "paycheck",
      icon: DollarSign,
      label: "Add Paycheck",
    },
    {
      key: "bills",
      icon: Calendar,
      label: "Manage Bills",
    },
    {
      key: "transactions",
      icon: BookOpen,
      label: "Transactions",
    },
    {
      key: "debts",
      icon: TrendingDown,
      label: "Debt Tracking",
    },
    {
      key: "analytics",
      icon: BarChart3,
      label: "Analytics",
    },
  ];

  return (
    <div className="glassmorphism rounded-3xl mb-6 lg:shadow-xl border border-white/20 ring-1 ring-gray-800/10 fixed bottom-0 left-0 right-0 lg:static z-40 overflow-hidden">
      <nav className="flex justify-evenly lg:justify-around overflow-x-auto scrollbar-hide pb-safe px-1 lg:px-0 gap-1 lg:gap-0">
        {tabs.map((tab) => (
          <NavButton
            key={tab.key}
            active={activeView === tab.key}
            onClick={() => onViewChange(tab.key)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </nav>
    </div>
  );
});

// eslint-disable-next-line no-unused-vars
const NavButton = memo(({ active, onClick, icon: _Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 lg:flex-1 flex flex-col items-center lg:flex-row lg:px-4 px-2 py-2 text-xs lg:text-sm font-medium transition-colors relative border border-black/10 ${
      active
        ? "border-t-2 lg:border-b-2 border-purple-500 text-purple-600 bg-purple-50/50 border-purple-400 ring-1 ring-purple-300"
        : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30 hover:border-purple-200"
    }`}
    style={{ minWidth: "75px" }} // Increase minimum tap target and prevent clipping
  >
    <_Icon className="h-4 w-4 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
    <span className="text-center lg:text-left leading-tight">
      {/* Responsive label display with better text truncation */}
      <span className="hidden lg:inline truncate">{label}</span>
      {/* Medium screens (tablets) - show abbreviated labels for long words */}
      <span className="hidden md:inline lg:hidden text-xs truncate max-w-[60px] overflow-hidden">
        {label === "Supplemental"
          ? "Extra"
          : label === "Analytics"
            ? "Stats"
            : label === "Debt Tracking"
              ? "Debts"
              : label === "Add Paycheck"
                ? "Paycheck"
                : label === "Manage Bills"
                  ? "Bills"
                  : label === "Savings Goals"
                    ? "Savings"
                    : label.split(" ")[0]}
      </span>
      {/* Small screens - show optimized short labels */}
      <span className="md:hidden text-xs truncate max-w-[50px] overflow-hidden whitespace-nowrap">
        {label === "Supplemental"
          ? "Extra"
          : label === "Analytics"
            ? "Chart"
            : label === "Add Paycheck"
              ? "Pay"
              : label === "Manage Bills"
                ? "Bills"
                : label === "Savings Goals"
                  ? "Save"
                  : label === "Debt Tracking"
                    ? "Debt"
                    : label.split(" ")[0]}
      </span>
    </span>
  </button>
));

export default NavigationTabs;
