import React, { useState, useMemo } from "react";
import { getIcon } from "../../utils";
import useAnalytics from "../../hooks/analytics/useAnalytics";
import { useBudgetStore } from "../../stores/ui/uiStore";
import ChartsAndAnalytics from "./ChartsAndAnalytics";
import TrendAnalysisCharts from "./TrendAnalysisCharts";
import PerformanceMonitor from "./PerformanceMonitor";
import ReportExporter from "./ReportExporter";
import StandardTabs from "../ui/StandardTabs";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import logger from "../../utils/common/logger";

/**
 * Enhanced Analytics Dashboard for v1.10.0
 * Features:
 * - Comprehensive financial overview
 * - Advanced chart visualizations
 * - Trend analysis and forecasting
 * - Performance monitoring
 * - Export functionality
 */
const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState("thisMonth");
  const [customDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get budget data
  const { transactions, envelopes } = useBudgetStore((state) => ({
    transactions: state.transactions,
    envelopes: state.envelopes,
  }));

  // Analytics data with current filters
  const analyticsQuery = useAnalytics({
    period: timeFilter,
    customDateRange,
    includeTransfers: false,
    groupBy: "category",
  });

  const balanceQuery = useAnalytics({
    period: timeFilter,
    customDateRange,
    includeTransfers: true,
    groupBy: "envelope",
  });

  // Tab configuration
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

  // Time filter options
  const timeFilters = [
    { key: "thisWeek", label: "This Week" },
    { key: "thisMonth", label: "This Month" },
    { key: "lastMonth", label: "Last Month" },
    { key: "thisYear", label: "This Year" },
    { key: "custom", label: "Custom Range" },
  ];

  // Summary metrics calculation
  const summaryMetrics = useMemo(() => {
    if (!analyticsQuery.analytics || !balanceQuery.analytics) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        envelopeUtilization: 0,
        savingsProgress: 0,
        balanceHealth: "unknown",
      };
    }

    const spending = analyticsQuery.analytics;
    const balance = balanceQuery.analytics;

    // Calculate envelope utilization
    const totalBudgeted =
      balance.envelopeBreakdown?.reduce((sum, env) => sum + (env.monthlyBudget || 0), 0) || 0;
    const totalSpent =
      balance.envelopeBreakdown?.reduce((sum, env) => sum + (env.spent || 0), 0) || 0;
    const envelopeUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // Calculate savings progress (simplified)
    const savingsProgress = 0;

    // Determine balance health (simplified)
    const balanceHealth = "unknown";

    return {
      totalIncome: spending.summary?.totalIncome || 0,
      totalExpenses: spending.summary?.totalExpenses || 0,
      netAmount: spending.summary?.netAmount || 0,
      envelopeUtilization,
      savingsProgress,
      balanceHealth,
    };
  }, [analyticsQuery.analytics, balanceQuery.analytics]);

  const handleExport = (format, options) => {
    logger.info("Exporting analytics report", { format, options, timeFilter });
    // Export functionality will be implemented in ReportExporter
  };

  if (analyticsQuery.isLoading || balanceQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (analyticsQuery.error || balanceQuery.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          {React.createElement(getIcon("AlertCircle"), {
            className: "h-5 w-5 text-red-600 mr-2",
          })}
          <h3 className="text-red-900 font-medium">Analytics Error</h3>
        </div>
        <p className="text-red-700 mt-2">Failed to load analytics data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-black text-black text-base">
            <span className="text-lg">A</span>NALYTICS <span className="text-lg">D</span>ASHBOARD
          </h1>
          <p className="text-purple-900 mt-1">Comprehensive financial insights and reporting</p>
        </div>

        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            {React.createElement(getIcon("Calendar"), {
              className: "h-4 w-4 text-gray-500",
            })}
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border-2 border-black rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {timeFilters.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Export Button */}
          <Button
            onClick={() => setShowExportModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 border-2 border-black flex items-center gap-2 text-sm"
          >
            {React.createElement(getIcon("Download"), { className: "h-4 w-4" })}
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummaryCards summaryMetrics={summaryMetrics} />

      {/* Navigation Tabs */}
      <StandardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="colored"
        className="border-2 border-black ring-1 ring-gray-800/10"
      />

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="font-black text-black text-base mb-4">
              <span className="text-lg">F</span>INANCIAL <span className="text-lg">O</span>VERVIEW
            </h2>
            <ChartsAndAnalytics
              transactions={transactions}
              envelopes={envelopes}
              timeFilter={timeFilter}
            />
          </div>
        )}

        {activeTab === "spending" && (
          <div>
            <h2 className="font-black text-black text-base mb-4">
              <span className="text-lg">S</span>PENDING <span className="text-lg">A</span>NALYSIS
            </h2>
            <ChartsAndAnalytics
              transactions={transactions}
              envelopes={envelopes}
              timeFilter={timeFilter}
              focus="spending"
            />
          </div>
        )}

        {activeTab === "trends" && (
          <div>
            <h2 className="font-black text-black text-base mb-4">
              <span className="text-lg">T</span>RENDS & <span className="text-lg">F</span>ORECASTING
            </h2>
            <TrendAnalysisCharts analyticsData={analyticsQuery.analytics} timeFilter={timeFilter} />
          </div>
        )}

        {activeTab === "performance" && (
          <div>
            <h2 className="font-black text-black text-base mb-4">
              <span className="text-lg">P</span>ERFORMANCE <span className="text-lg">M</span>ONITOR
            </h2>
            <PerformanceMonitor
              analyticsData={analyticsQuery.analytics}
              balanceData={balanceQuery.analytics}
            />
          </div>
        )}

        {activeTab === "envelopes" && (
          <div>
            <h2 className="font-black text-black text-base mb-4">
              <span className="text-lg">E</span>NVELOPE <span className="text-lg">A</span>NALYSIS
            </h2>
            <ChartsAndAnalytics
              transactions={transactions}
              envelopes={envelopes}
              timeFilter={timeFilter}
              focus="envelopes"
            />
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ReportExporter
          analyticsData={analyticsQuery.analytics}
          balanceData={balanceQuery.analytics}
          timeFilter={timeFilter}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
