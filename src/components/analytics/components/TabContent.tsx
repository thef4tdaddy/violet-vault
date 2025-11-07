import OverviewTab from "../tabs/OverviewTab";
import TrendsTab from "../tabs/TrendsTab";
import HealthTab from "../tabs/HealthTab";
import CategoriesTab from "../tabs/CategoriesTab";

/**
 * Tab content renderer for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const TabContent = ({
  activeTab,
  chartType,
  handleChartTypeChange,
  monthlyTrends,
  envelopeSpending,
  weeklyPatterns,
  envelopeHealth,
  budgetVsActual,
  categoryBreakdown,
  selectedCategory,
  onCategorySelect,
  categoryTransactions,
}) => {
  if (activeTab === "overview") {
    return <OverviewTab monthlyTrends={monthlyTrends} envelopeSpending={envelopeSpending} />;
  }

  if (activeTab === "trends") {
    return (
      <TrendsTab
        chartType={chartType}
        handleChartTypeChange={handleChartTypeChange}
        monthlyTrends={monthlyTrends}
        weeklyPatterns={weeklyPatterns}
      />
    );
  }

  if (activeTab === "health") {
    return <HealthTab envelopeHealth={envelopeHealth} budgetVsActual={budgetVsActual} />;
  }

  if (activeTab === "categories") {
    return (
      <CategoriesTab
        categoryBreakdown={categoryBreakdown}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        categoryTransactions={categoryTransactions}
      />
    );
  }

  return null;
};

export default TabContent;
