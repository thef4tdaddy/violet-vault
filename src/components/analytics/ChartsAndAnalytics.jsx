import React from "react";
import { useAnalyticsData } from "../../hooks/analytics/useAnalyticsData";
import { useChartsAnalytics } from "../../hooks/analytics/useChartsAnalytics";
import { useAnalyticsExport } from "../../hooks/analytics/useAnalyticsExport";
import AnalyticsHeader from "./components/AnalyticsHeader";
import MetricsGrid from "./components/MetricsGrid";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";

const ChartsAnalytics = ({
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

  const handleExport = () => {
    exportAnalyticsData(
      {
        dateRange,
        metrics,
        monthlyTrends,
        envelopeSpending,
        categoryBreakdown,
      },
      currentUser,
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
    </div>
  );
};

export default ChartsAnalytics;
