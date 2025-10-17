import React from "react";
import { getIcon } from "../../../utils";

/**
 * Tab navigation component for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TabNavigation = ({ activeTab, handleTabChange }) => {
  const tabs = [
    { id: "overview", name: "Overview", icon: "BarChart3" },
    { id: "trends", name: "Trends", icon: "TrendingUp" },
    { id: "health", name: "Health", icon: "Heart" },
    { id: "categories", name: "Categories", icon: "PieChart" },
  ];

  return (
    <div className="glassmorphism rounded-xl overflow-hidden">
      <nav className="flex">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                : "border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/30"
            }`}
          >
            {React.createElement(getIcon(tab.icon), {
              className: "h-4 w-4 inline mr-2",
            })}
            {tab.name}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
