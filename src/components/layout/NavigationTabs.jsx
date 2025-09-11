import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getIcon } from "../../utils";

/**
 * Navigation tabs component for the main layout
 * Updated with modern glassmorphism design while preserving React Router functionality
 */
const NavigationTabs = memo(() => {
  const location = useLocation();

  const tabs = [
    {
      key: "dashboard",
      path: "/",
      icon: "Home",
      label: "Dashboard",
    },
    {
      key: "envelopes",
      path: "/envelopes",
      icon: "Package",
      label: "Envelopes",
    },
    {
      key: "savings",
      path: "/savings",
      icon: "Target",
      label: "Savings Goals",
    },
    {
      key: "paycheck",
      path: "/paycheck",
      icon: "Banknote",
      label: "Paychecks",
    },
    {
      key: "bills",
      path: "/bills",
      icon: "Receipt",
      label: "Bills",
    },
    {
      key: "transactions",
      path: "/transactions",
      icon: "CreditCard",
      label: "Transactions",
    },
    {
      key: "debts",
      path: "/debts",
      icon: "TrendingDown",
      label: "Debt",
    },
    {
      key: "analytics",
      path: "/analytics",
      icon: "BarChart3",
      label: "Analytics",
    },
    {
      key: "settings",
      path: "/settings",
      icon: "Settings",
      label: "Settings",
    },
  ];

  // Get current active view from URL
  const getCurrentView = () => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab?.key || "dashboard";
  };

  const activeView = getCurrentView();

  return (
    <div className="px-6 mb-6">
      <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-white/40 backdrop-blur-sm">
        <nav className="flex overflow-x-auto gap-2 pb-1">
          {tabs.map((tab) => (
            <NavButton
              key={tab.key}
              active={activeView === tab.key}
              to={tab.path}
              icon={tab.icon}
              label={tab.label}
              viewKey={tab.key}
            />
          ))}
        </nav>
      </div>
    </div>
  );
});

const NavButton = memo(({ active, to, icon, label, viewKey }) => {
  const IconComponent = getIcon(icon);

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      data-view={viewKey}
      data-tab={viewKey}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-black
        whitespace-nowrap transition-colors flex-shrink-0
        ${
          active
            ? "bg-purple-200/60 text-purple-900 font-semibold"
            : "bg-white/60 text-gray-700 hover:bg-purple-100/40"
        }
      `}
      style={{ minWidth: "75px" }}
    >
      <IconComponent className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
});

export default NavigationTabs;
