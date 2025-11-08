import StandardTabs from "@/components/ui/StandardTabs";
import { getIcon } from "@/utils";

interface TabNavigationProps {
  activeTab: string;
  handleTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * Tab navigation component for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TabNavigation = ({ activeTab, handleTabChange, className = "" }: TabNavigationProps) => {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: getIcon("BarChart3"),
      color: "blue" as const,
    },
    {
      id: "trends",
      label: "Trends",
      icon: getIcon("TrendingUp"),
      color: "green" as const,
    },
    {
      id: "health",
      label: "Health",
      icon: getIcon("Heart"),
      color: "red" as const,
    },
    {
      id: "categories",
      label: "Categories",
      icon: getIcon("PieChart"),
      color: "amber" as const,
    },
  ];

  return (
    <div className={`bg-slate-100 px-4 pt-4 border-b-2 border-black ${className}`}>
      <StandardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="colored"
        className="bg-transparent"
      />
    </div>
  );
};

export default TabNavigation;
