import React, { useState, useMemo } from "react";
import useAnalytics from "@/hooks/analytics/useAnalytics";
import ReportExporter from "./ReportExporter";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsDashboardHeader from "./dashboard/AnalyticsDashboardHeader";
import AnalyticsTabNavigation from "./dashboard/AnalyticsTabNavigation";
import AnalyticsLoadingState from "./dashboard/AnalyticsLoadingState";
import AnalyticsErrorState from "./dashboard/AnalyticsErrorState";
import OverviewTabContent from "./dashboard/OverviewTabContent";
import SpendingTabContent from "./dashboard/SpendingTabContent";
import TrendsTabContent from "./dashboard/TrendsTabContent";
import PerformanceTabContent from "./dashboard/PerformanceTabContent";
import EnvelopeTabContent from "./dashboard/EnvelopeTabContent";
import { FinancialInsights } from "./insights";
import logger from "@/utils/common/logger";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";

/**
 * Render active tab content based on selected tab
 * Extracted to reduce component complexity
 */
const TabContentRenderer: React.FC<{
  activeTab: string;
  transactions: unknown[];
  envelopes: unknown[];
  timeFilter: string;
  analyticsData: unknown;
  balanceData: unknown;
}> = ({ activeTab, transactions, envelopes, timeFilter, analyticsData, balanceData }) => {
  if (activeTab === "overview") {
    return (
      <OverviewTabContent
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
      />
    );
  }

  if (activeTab === "spending") {
    return (
      <SpendingTabContent
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
      />
    );
  }

  if (activeTab === "trends") {
    return <TrendsTabContent analyticsData={analyticsData} timeFilter={timeFilter} />;
  }

  if (activeTab === "performance") {
    return <PerformanceTabContent analyticsData={analyticsData} balanceData={balanceData} />;
  }

  if (activeTab === "envelopes") {
    return (
      <EnvelopeTabContent
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
      />
    );
  }

  return null;
};

/**
 * Calculate summary metrics from analytics data
 * Extracted to reduce component complexity
 */
const calculateSummaryMetrics = (analyticsData: unknown, balanceData: unknown) => {
  if (!analyticsData || !balanceData) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
      envelopeUtilization: 0,
      savingsProgress: 0,
      balanceHealth: "unknown",
    };
  }

  const spending = analyticsData as {
    summary?: { totalIncome?: number; totalExpenses?: number; netAmount?: number };
  };
  const balance = balanceData as { envelopeBreakdown?: Record<string, unknown> };

  // Calculate envelope utilization
  const envelopeBreakdown = balance.envelopeBreakdown;
  const totalBudgeted: number = envelopeBreakdown
    ? (Object.values(envelopeBreakdown).reduce(
        (sum: number, env: unknown) =>
          sum + ((env as { monthlyBudget?: number }).monthlyBudget || 0),
        0
      ) as number)
    : 0;
  const totalSpent: number = envelopeBreakdown
    ? (Object.values(envelopeBreakdown).reduce(
        (sum: number, env: unknown) => sum + ((env as { spent?: number }).spent || 0),
        0
      ) as number)
    : 0;
  const envelopeUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return {
    totalIncome: spending.summary?.totalIncome || 0,
    totalExpenses: spending.summary?.totalExpenses || 0,
    netAmount: spending.summary?.netAmount || 0,
    envelopeUtilization,
    savingsProgress: 0,
    balanceHealth: "unknown",
  };
};

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
  const [timeFilter, setTimeFilter] = useState("allTime");
  const [customDateRange] = useState<{ start: string | Date; end: string | Date } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get budget data from TanStack Query
  const { transactions = [] } = useTransactions();
  const { envelopes = [] } = useEnvelopes();

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

  // Debug: Log what analytics queries are returning
  logger.debug("📊 Analytics Dashboard Data Check:", {
    hasAnalyticsData: !!analyticsQuery.analytics,
    hasBalanceData: !!balanceQuery.analytics,
    hasVelocity: !!analyticsQuery.analytics?.velocity,
    hasTopCategories: !!analyticsQuery.analytics?.topCategories,
    hasHealthScore: analyticsQuery.analytics?.healthScore !== undefined,
    analyticsKeys: analyticsQuery.analytics ? Object.keys(analyticsQuery.analytics) : [],
    isLoading: analyticsQuery.isLoading || balanceQuery.isLoading,
    isError: analyticsQuery.isError || balanceQuery.isError,
    error: analyticsQuery.error || balanceQuery.error,
  });

  // Summary metrics calculation
  const summaryMetrics = useMemo(
    () => calculateSummaryMetrics(analyticsQuery.analytics, balanceQuery.analytics),
    [analyticsQuery.analytics, balanceQuery.analytics]
  );

  const handleExport = (format: unknown, options: unknown) => {
    logger.info("Exporting analytics report", { format, options, timeFilter });
    // Export functionality will be implemented in ReportExporter
  };

  if (analyticsQuery.isLoading || balanceQuery.isLoading) {
    return <AnalyticsLoadingState />;
  }

  if (analyticsQuery.error || balanceQuery.error) {
    return (
      <AnalyticsErrorState
        error={String(analyticsQuery.error || balanceQuery.error)}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      <AnalyticsDashboardHeader
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onExportClick={() => setShowExportModal(true)}
      />

      <AnalyticsSummaryCards summaryMetrics={summaryMetrics} />

      <AnalyticsTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg border-2 border-black p-6 shadow-sm">
          <TabContentRenderer
            activeTab={activeTab}
            transactions={transactions}
            envelopes={envelopes}
            timeFilter={timeFilter}
            analyticsData={analyticsQuery.analytics}
            balanceData={balanceQuery.analytics}
          />
        </div>

        {/* Insights Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          {analyticsQuery.analytics?.velocity &&
          analyticsQuery.analytics?.topCategories &&
          analyticsQuery.analytics?.healthScore !== undefined ? (
            <FinancialInsights
              velocity={analyticsQuery.analytics.velocity}
              topCategories={analyticsQuery.analytics.topCategories}
              healthScore={analyticsQuery.analytics.healthScore}
            />
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-6">
              <p className="text-gray-500 text-sm">
                {analyticsQuery.isLoading
                  ? "Loading insights..."
                  : !analyticsQuery.analytics
                    ? "No analytics data available"
                    : `Insights not available (velocity: ${!!analyticsQuery.analytics?.velocity}, categories: ${!!analyticsQuery.analytics?.topCategories}, health: ${analyticsQuery.analytics?.healthScore !== undefined})`}
              </p>
            </div>
          )}
        </div>
      </div>

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

export { AnalyticsDashboard };
export default AnalyticsDashboard;
