import StandardTabs from "@/components/ui/StandardTabs";
import { getIcon } from "../../../utils";

/**
 * Tab navigation component for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TabNavigation = ({ activeTab, handleTabChange }) => {
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
    <StandardTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      variant="colored"
      className="border-2 border-black ring-1 ring-gray-800/10"
    />
  );
};

export default TabNavigation;
