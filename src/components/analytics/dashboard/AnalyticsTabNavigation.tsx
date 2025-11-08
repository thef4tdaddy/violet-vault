import React from "react";
import StandardTabs from "@/components/ui/StandardTabs";
import { getIcon } from "@/utils";

interface AnalyticsTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const AnalyticsTabNavigation: React.FC<AnalyticsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  className = "",
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
    <div className={`bg-slate-100 px-4 pt-4 border-b-2 border-black ${className}`}>
      <StandardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        variant="colored"
        className="bg-transparent"
      />
    </div>
  );
};

export default AnalyticsTabNavigation;
