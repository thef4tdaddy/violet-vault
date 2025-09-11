import React from "react";
import { getIcon } from "../../utils";

/**
 * Dashboard Navigation Tabs
 *
 * Features:
 * - Horizontal scrollable navigation
 * - Icon + text labels
 * - Active state highlighting
 * - Mobile-friendly scrolling
 */
const NavigationTabs = ({ setActiveView }) => {
  const navigationItems = [
    { key: "dashboard", label: "Dashboard", icon: "Home" },
    { key: "envelopes", label: "Envelopes", icon: "Package" },
    { key: "savings", label: "Savings Goals", icon: "Target" },
    { key: "paychecks", label: "Paychecks", icon: "Banknote" },
    { key: "bills", label: "Bills", icon: "Receipt" },
    { key: "transactions", label: "Transactions", icon: "CreditCard" },
    { key: "debt", label: "Debt", icon: "TrendingDown" },
    { key: "analytics", label: "Analytics", icon: "BarChart3" },
    { key: "settings", label: "Settings", icon: "Settings" },
  ];

  const handleNavigation = (viewKey) => {
    if (setActiveView) {
      setActiveView(viewKey);
    }
  };

  return (
    <div className="px-6 mb-6">
      <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-white/40 backdrop-blur-sm">
        <div className="flex overflow-x-auto gap-2 pb-1">
          {navigationItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleNavigation(key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-black
                whitespace-nowrap transition-colors flex-shrink-0
                ${
                  key === "dashboard"
                    ? "bg-purple-200/60 text-purple-900 font-semibold"
                    : "bg-white/60 text-gray-700 hover:bg-purple-100/40"
                }
              `}
            >
              {React.createElement(getIcon(icon), { className: "h-4 w-4" })}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;
