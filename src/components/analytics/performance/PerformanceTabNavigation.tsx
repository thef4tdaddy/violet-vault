import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface PerformanceTabNavigationProps {
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  alertsCount: number;
  recommendationsCount: number;
}

/**
 * PerformanceTabNavigation component - tab navigation for performance monitor
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceTabNavigation: React.FC<PerformanceTabNavigationProps> = ({
  selectedMetric,
  setSelectedMetric,
  alertsCount,
  recommendationsCount,
}) => {
  const Eye = getIcon("Eye");
  const Bell = getIcon("Bell");
  const Zap = getIcon("Zap");

  const tabs = [
    { id: "overview", name: "Overview", Icon: Eye },
    {
      id: "alerts",
      name: "Alerts",
      Icon: Bell,
      count: alertsCount,
    },
    {
      id: "recommendations",
      name: "Tips",
      Icon: Zap,
      count: recommendationsCount,
    },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => setSelectedMetric(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
            selectedMetric === tab.id
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {React.createElement(tab.Icon, { className: "h-4 w-4" })}
          {tab.name}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default PerformanceTabNavigation;
