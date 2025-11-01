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
      color: "blue" as const,
    },
    {
      id: "spending",
      label: "Spending Analysis",
      icon: getIcon("TrendingDown"),
      color: "red" as const,
    },
    {
      id: "trends",
      label: "Trends & Forecasting",
      icon: getIcon("TrendingUp"),
      color: "green" as const,
    },
    {
      id: "performance",
      label: "Performance Monitor",
      icon: getIcon("Target"),
      color: "purple" as const,
    },
    {
      id: "envelopes",
      label: "Envelope Analysis",
      icon: getIcon("Wallet"),
      color: "cyan" as const,
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
