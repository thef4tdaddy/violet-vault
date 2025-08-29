import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Calendar,
  Filter,
  Eye,
  AlertCircle,
  Target,
  DollarSign,
  Wallet,
  PieChart,
} from "lucide-react";
import { useAnalytics } from "../../hooks/analytics/useAnalytics";
import { useBudgetStore } from "../../stores/budgetStore";
import ChartsAndAnalytics from "./ChartsAndAnalytics";
import TrendAnalysisCharts from "./TrendAnalysisCharts";
import PerformanceMonitor from "./PerformanceMonitor";
import ReportExporter from "./ReportExporter";
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
  const [customDateRange, setCustomDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get budget data
  const {
    transactions,
    envelopes,
    savingsGoals,
    actualBalance,
    unassignedCash,
  } = useBudgetStore();

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
      key: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Financial summary and key metrics",
    },
    {
      key: "spending",
      label: "Spending Analysis",
      icon: TrendingDown,
      description: "Detailed spending patterns and categories",
    },
    {
      key: "trends",
      label: "Trends & Forecasting",
      icon: TrendingUp,
      description: "Historical trends and future projections",
    },
    {
      key: "performance",
      label: "Performance Monitor",
      icon: Target,
      description: "Real-time insights and alerts",
    },
    {
      key: "envelopes",
      label: "Envelope Analysis",
      icon: Wallet,
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
    if (!analyticsQuery.data || !balanceQuery.data) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        envelopeUtilization: 0,
        savingsProgress: 0,
        balanceHealth: "unknown",
      };
    }

    const spending = analyticsQuery.data;
    const balance = balanceQuery.data;

    // Calculate envelope utilization
    const totalBudgeted =
      balance.envelopeAnalysis?.reduce(
        (sum, env) => sum + (env.monthlyBudget || 0),
        0,
      ) || 0;
    const totalSpent =
      balance.envelopeAnalysis?.reduce(
        (sum, env) => sum + (env.spent || 0),
        0,
      ) || 0;
    const envelopeUtilization =
      totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // Calculate savings progress
    const savingsProgress =
      balance.savingsAnalysis?.reduce(
        (sum, goal) => sum + goal.progressRate,
        0,
      ) / Math.max(1, balance.savingsAnalysis?.length || 1);

    // Determine balance health
    const balanceHealth = balance.balanceSummary?.isBalanced
      ? "healthy"
      : Math.abs(balance.balanceSummary?.difference || 0) < 100
        ? "warning"
        : "critical";

    return {
      totalIncome: spending.totalIncome || 0,
      totalExpenses: spending.totalExpenses || 0,
      netAmount: spending.netAmount || 0,
      envelopeUtilization,
      savingsProgress,
      balanceHealth,
    };
  }, [analyticsQuery.data, balanceQuery.data]);

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
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-red-900 font-medium">Analytics Error</h3>
        </div>
        <p className="text-red-700 mt-2">
          Failed to load analytics data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive financial insights and reporting
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {timeFilters.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Amount</p>
              <p
                className={`text-2xl font-bold ${
                  summaryMetrics.netAmount >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${Math.abs(summaryMetrics.netAmount).toLocaleString()}
              </p>
            </div>
            {summaryMetrics.netAmount >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Envelope Utilization</p>
              <p className="text-2xl font-bold text-blue-600">
                {summaryMetrics.envelopeUtilization.toFixed(1)}%
              </p>
            </div>
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Savings Progress</p>
              <p className="text-2xl font-bold text-purple-600">
                {summaryMetrics.savingsProgress.toFixed(1)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance Health</p>
              <p
                className={`text-2xl font-bold capitalize ${
                  summaryMetrics.balanceHealth === "healthy"
                    ? "text-green-600"
                    : summaryMetrics.balanceHealth === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {summaryMetrics.balanceHealth}
              </p>
            </div>
            <DollarSign
              className={`h-8 w-8 ${
                summaryMetrics.balanceHealth === "healthy"
                  ? "text-green-600"
                  : summaryMetrics.balanceHealth === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Financial Overview
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Spending Analysis
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trends & Forecasting
            </h2>
            <TrendAnalysisCharts
              analyticsData={analyticsQuery.data}
              timeFilter={timeFilter}
            />
          </div>
        )}

        {activeTab === "performance" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Monitor
            </h2>
            <PerformanceMonitor
              analyticsData={analyticsQuery.data}
              balanceData={balanceQuery.data}
            />
          </div>
        )}

        {activeTab === "envelopes" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Envelope Analysis
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
          analyticsData={analyticsQuery.data}
          balanceData={balanceQuery.data}
          timeFilter={timeFilter}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
