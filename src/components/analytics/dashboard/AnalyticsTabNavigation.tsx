import React from "react";
import StandardTabs from "@/components/ui/StandardTabs";
import { getIcon } from "@/utils";

interface AnalyticsTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AnalyticsTabNavigation: React.FC<AnalyticsTabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: getIcon("BarChart3"),
      color: "blue",
      description: "Financial summary and key metrics",
    },
    {
      id: "spending",
      label: "Spending Analysis",
      icon: getIcon("TrendingDown"),
      color: "red",
      description: "Detailed spending patterns and categories",
    },
    {
      id: "trends",
      label: "Trends & Forecasting",
      icon: getIcon("TrendingUp"),
      color: "green",
      description: "Historical trends and future projections",
    },
    {
      id: "performance",
      label: "Performance Monitor",
      icon: getIcon("Target"),
      color: "purple",
      description: "Real-time insights and alerts",
    },
    {
      id: "envelopes",
      label: "Envelope Analysis",
      icon: getIcon("Wallet"),
      color: "cyan",
      description: "Envelope health and utilization",
    },
  ];

  return (
    <StandardTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="colored"
      className="border-2 border-black ring-1 ring-gray-800/10"
    />
  );
};

export default AnalyticsTabNavigation;
