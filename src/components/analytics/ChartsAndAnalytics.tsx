import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { useChartsAnalytics } from "@/hooks/analytics/useChartsAnalytics";
import { useAnalyticsExport } from "@/hooks/analytics/useAnalyticsExport";
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

  // Show empty state if no transactions
  if (!hasTransactions) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <AnalyticsHeader
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          handleExport={handleExport}
        />

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="rounded-lg p-8 border-2 border-black bg-purple-100/40 backdrop-blur-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black">
              <span className="text-white font-black text-2xl">📊</span>
            </div>
            <h3 className="font-black text-black text-xl mb-3">
              <span className="text-2xl">N</span>O <span className="text-2xl">A</span>NALYTICS{" "}
              <span className="text-2xl">D</span>ATA
            </h3>
            <p className="text-purple-900 text-sm leading-relaxed mb-4">
              Analytics will appear after you add some transactions. Try adding at least 7-14 days
              of transaction data for meaningful insights.
            </p>
            <div className="bg-purple-50/60 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-800">
                💡 <strong>Tip:</strong> Import transactions or manually add a few to get started
                with analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show limited data message if filtered transactions are empty
  if (!hasFilteredTransactions) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <AnalyticsHeader
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          handleExport={handleExport}
        />

        {/* Limited Data State */}
        <div className="text-center py-16">
          <div className="rounded-lg p-8 border-2 border-black bg-blue-100/40 backdrop-blur-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black">
              <span className="text-white font-black text-2xl">📅</span>
            </div>
            <h3 className="font-black text-black text-xl mb-3">
              <span className="text-2xl">N</span>O <span className="text-2xl">D</span>ATA{" "}
              <span className="text-2xl">F</span>OR <span className="text-2xl">P</span>ERIOD
            </h3>
            <p className="text-blue-900 text-sm leading-relaxed mb-4">
              No transactions found for the selected time period. Try expanding the date range or
              add more transactions.
            </p>
            <div className="bg-blue-50/60 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800">
                📈 Analytics work best with 14+ days of transaction data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        filteredTransactions={
          (Array.isArray(filteredTransactions)
            ? filteredTransactions
            : []) as unknown as import("@/types/analytics").Transaction[]
        }
        metrics={(metrics || {}) as unknown as import("@/types/analytics").AnalyticsMetrics}
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
