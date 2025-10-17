import React from "react";
import { useAnalyticsData } from "../../hooks/analytics/useAnalyticsData";
import { useChartsAnalytics } from "../../hooks/analytics/useChartsAnalytics";
import { useAnalyticsExport } from "../../hooks/analytics/useAnalyticsExport";
import AnalyticsHeader from "./components/AnalyticsHeader";
import MetricsGrid from "./components/MetricsGrid";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import { ChartsAnalyticsProps } from "../../types/analytics";

const ChartsAnalytics: React.FC<ChartsAnalyticsProps> = ({
  transactions = [],
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  timeFilter = "thisMonth",
  focus = "overview",
}) => {
  const analyticsData = useAnalyticsData({
    transactions,
    envelopes,
    timeFilter,
  });

  const { exportAnalyticsData } = useAnalyticsExport();
  const {
    activeTab,
    chartType,
    dateRange,
    handleDateRangeChange,
    handleChartTypeChange,
    handleTabChange,
  } = useChartsAnalytics(timeFilter, focus);

  const {
    filteredTransactions,
    monthlyTrends,
    envelopeSpending,
    categoryBreakdown,
    weeklyPatterns,
    envelopeHealth,
    budgetVsActual,
    metrics,
  } = analyticsData;

  // Check if we have any transaction data
  const hasTransactions = Array.isArray(transactions) && transactions.length > 0;
  const hasFilteredTransactions =
    Array.isArray(filteredTransactions) && filteredTransactions.length > 0;

  const handleExport = () => {
    exportAnalyticsData(
      {
        dateRange,
        metrics,
        monthlyTrends,
        envelopeSpending,
        categoryBreakdown,
      },
      currentUser
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
        handleExport={handleExport}
      />

      {/* Key Metrics */}
      <MetricsGrid
        filteredTransactions={filteredTransactions}
        metrics={metrics}
        envelopes={envelopes}
      />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        chartType={chartType}
        handleChartTypeChange={handleChartTypeChange}
        monthlyTrends={monthlyTrends}
        envelopeSpending={envelopeSpending}
        weeklyPatterns={weeklyPatterns}
        envelopeHealth={envelopeHealth}
        budgetVsActual={budgetVsActual}
        categoryBreakdown={categoryBreakdown}
      />

      {/* Show no data message if applicable */}
      {!hasTransactions && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium">No Transaction Data</h3>
            <p className="mt-2">Add some transactions to see detailed analytics and charts.</p>
          </div>
        </div>
      )}

      {hasTransactions && !hasFilteredTransactions && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium">No Data for Selected Period</h3>
            <p className="mt-2">Try selecting a different date range to see analytics.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsAnalytics;
