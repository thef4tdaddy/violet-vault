import { useState, useMemo } from "react";
import useAnalytics from "@/hooks/analytics/useAnalytics";
import { useBudgetStore } from "@/stores/ui/uiStore";
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
import logger from "@/utils/common/logger";

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
  const [customDateRange] = useState<{ start: string | Date; end: string | Date } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get budget data
  const { transactions, envelopes } = useBudgetStore(
    (state: { transactions: unknown; envelopes: unknown }) => ({
      transactions: state.transactions,
      envelopes: state.envelopes,
    })
  );

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
    const envelopeBreakdown = balance.envelopeBreakdown;
    const totalBudgeted = envelopeBreakdown
      ? Object.values(envelopeBreakdown).reduce(
          (sum, env: unknown) => sum + ((env as { monthlyBudget?: number }).monthlyBudget || 0),
          0
        )
      : 0;
    const totalSpent = envelopeBreakdown
      ? Object.values(envelopeBreakdown).reduce(
          (sum, env: unknown) => sum + ((env as { spent?: number }).spent || 0),
          0
        )
      : 0;
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

      <div className="bg-white rounded-lg border-2 border-black p-6 shadow-sm">
        {activeTab === "overview" && (
          <OverviewTabContent
            transactions={transactions}
            envelopes={envelopes}
            timeFilter={timeFilter}
          />
        )}

        {activeTab === "spending" && (
          <SpendingTabContent
            transactions={transactions}
            envelopes={envelopes}
            timeFilter={timeFilter}
          />
        )}

        {activeTab === "trends" && (
          <TrendsTabContent analyticsData={analyticsQuery.analytics} timeFilter={timeFilter} />
        )}

        {activeTab === "performance" && (
          <PerformanceTabContent
            analyticsData={analyticsQuery.analytics}
            balanceData={balanceQuery.analytics}
          />
        )}

        {activeTab === "envelopes" && (
          <EnvelopeTabContent
            transactions={transactions}
            envelopes={envelopes}
            timeFilter={timeFilter}
          />
        )}
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
