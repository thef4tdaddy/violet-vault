import React from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  Target,
  CreditCard,
  BookOpen,
  BarChart3,
} from "lucide-react";

/**
 * Navigation tabs component for the main layout
 * Extracted from Layout.jsx for better organization
 */
const NavigationTabs = ({ activeView, onViewChange }) => {
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
      key: "analytics",
      icon: BarChart3,
      label: "Analytics",
    },
  ];

  return (
    <div className="glassmorphism rounded-t-3xl sm:rounded-3xl mb-6 sm:shadow-xl border border-white/20 fixed bottom-0 left-0 right-0 sm:static z-40">
      <nav className="flex justify-around overflow-x-auto">
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
};

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center sm:flex-row sm:px-6 px-2 py-3 text-xs sm:text-sm font-semibold border-t-2 sm:border-b-2 transition-all ${
      active
        ? "border-purple-500 text-purple-600 bg-purple-50/50"
        : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
    }`}
  >
    <Icon className="h-5 w-5 mb-1 sm:mb-0 sm:mr-3" />
    <span>{label}</span>
  </button>
);

export default NavigationTabs;