import React from "react";
import { getIcon } from "../../utils/icons";

const CategoryNavigationTabs = ({ activeTab, onTabChange, suggestionCount, categoryCount }) => {
  const tabs = [
    {
      id: "suggestions",
      name: "Suggestions", 
      icon: getIcon("info") || getIcon("lightbulb"), // Using info as fallback if lightbulb not available
      count: suggestionCount,
    },
    {
      id: "analysis", 
      name: "Analysis",
      icon: getIcon("BarChart3"),
      count: categoryCount,
    },
    {
      id: "settings",
      name: "Advanced", 
      icon: getIcon("settings"),
    },
  ];

  return (
    <div className="flex border-b-2 border-black mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all shadow-sm hover:shadow-md ${
            activeTab === tab.id
              ? "border-emerald-500 text-emerald-600 bg-emerald-50/60 backdrop-blur-sm"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/60 backdrop-blur-sm"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
          {tab.count !== undefined && (
            <span className="bg-gradient-to-r from-gray-100 to-purple-100 text-purple-900 px-2 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryNavigationTabs;
