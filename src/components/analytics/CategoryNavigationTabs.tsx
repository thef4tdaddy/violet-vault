import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/icons";

type TabId = "suggestions" | "analysis" | "settings";

interface CategoryNavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: TabId) => void;
  suggestionCount: number;
  categoryCount: number;
}

interface TabConfig {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const CategoryNavigationTabs = ({
  activeTab,
  onTabChange,
  suggestionCount,
  categoryCount,
}: CategoryNavigationTabsProps) => {
  const tabs: TabConfig[] = [
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
        <Button
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
            <span className="bg-linear-to-r from-gray-100 to-purple-100 text-purple-900 px-2 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm">
              {tab.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default CategoryNavigationTabs;
