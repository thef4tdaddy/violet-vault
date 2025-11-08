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
import type { VelocityData, TopCategory } from "./insights/FinancialInsights";
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
        analyticsData={analyticsData}
      />
    );
  }

  if (activeTab === "spending") {
    return (
      <SpendingTabContent
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
        analyticsData={analyticsData}
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
        analyticsData={analyticsData}
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
      expenseTransactionCount: 0,
      totalTransactionCount: 0,
      healthScore: 0,
    };
  }

  const spending = analyticsData as {
    summary?: {
      totalIncome?: number;
      totalExpenses?: number;
      netAmount?: number;
      expenseTransactionCount?: number;
      transactionCount?: number;
    };
    healthScore?: number;
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
    expenseTransactionCount: spending.summary?.expenseTransactionCount || 0,
    totalTransactionCount: spending.summary?.transactionCount || 0,
    savingsProgress: 0,
    balanceHealth: "unknown",
    healthScore:
      typeof spending.healthScore === "number" && Number.isFinite(spending.healthScore)
        ? Math.max(0, Math.min(100, spending.healthScore))
        : 0,
  };
};

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

  // Debug logging for analytics data
  if (import.meta.env.MODE === "development") {
    logger.debug("📊 Analytics Dashboard Data Check:", {
      hasVelocity: !!analyticsQuery.analytics?.velocity,
      hasTopCategories: !!analyticsQuery.analytics?.topCategories,
      hasHealthScore: analyticsQuery.analytics?.healthScore !== undefined,
    });
  }

  // Summary metrics calculation
  const summaryMetrics = useMemo(
    () => calculateSummaryMetrics(analyticsQuery.analytics, balanceQuery.analytics),
    [analyticsQuery.analytics, balanceQuery.analytics]
  );

  const resolvedVelocity: VelocityData = useMemo(() => {
    const rawVelocity = (analyticsQuery.analytics as Record<string, unknown>)?.velocity;
    if (rawVelocity && typeof rawVelocity === "object") {
      const velocityRecord = rawVelocity as Record<string, unknown>;
      return {
        averageMonthlyExpenses: Number(velocityRecord.averageMonthlyExpenses ?? 0),
        averageMonthlyIncome: Number(velocityRecord.averageMonthlyIncome ?? 0),
        trendDirection:
          (velocityRecord.trendDirection as VelocityData["trendDirection"]) || "stable",
        velocityChange: Number(velocityRecord.velocityChange ?? 0),
        percentChange:
          velocityRecord.percentChange !== undefined
            ? Number(velocityRecord.percentChange)
            : undefined,
        projectedNextMonth: Number(velocityRecord.projectedNextMonth ?? 0),
      };
    }

    return {
      averageMonthlyExpenses: 0,
      averageMonthlyIncome: 0,
      trendDirection: "stable",
      velocityChange: 0,
      projectedNextMonth: 0,
    };
  }, [analyticsQuery.analytics]);

  const resolvedTopCategories: TopCategory[] = useMemo(() => {
    const rawCategories = (analyticsQuery.analytics as Record<string, unknown>)?.topCategories;
    if (!Array.isArray(rawCategories)) {
      return [];
    }

    return rawCategories
      .map((category) => {
        const categoryRecord = category as Record<string, unknown>;
        const name = String(categoryRecord.name ?? "").trim();
        if (!name) {
          return null;
        }

        return {
          name,
          expenses: Number(categoryRecord.expenses ?? 0),
          count: Number(categoryRecord.count ?? 0),
          percentOfTotal: Number(categoryRecord.percentOfTotal ?? 0),
          avgTransactionSize: Number(categoryRecord.avgTransactionSize ?? 0),
        };
      })
      .filter((category): category is TopCategory => category !== null);
  }, [analyticsQuery.analytics]);

  const resolvedHealthScore = useMemo(() => {
    const healthScore = (analyticsQuery.analytics as Record<string, unknown>)?.healthScore;
    if (typeof healthScore === "number" && Number.isFinite(healthScore)) {
      return Math.max(0, Math.min(100, healthScore));
    }
    return 0;
  }, [analyticsQuery.analytics]);

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border-2 border-black bg-purple-100/70 backdrop-blur-md p-8 shadow-xl space-y-6">
      <AnalyticsDashboardHeader
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onExportClick={() => setShowExportModal(true)}
      />

      <AnalyticsSummaryCards summaryMetrics={summaryMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border-2 border-black shadow-lg overflow-hidden">
            <AnalyticsTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="px-6 pb-6 pt-5">
              <TabContentRenderer
                activeTab={activeTab}
                transactions={transactions}
                envelopes={envelopes}
                timeFilter={timeFilter}
                analyticsData={analyticsQuery.analytics}
                balanceData={balanceQuery.analytics}
              />
            </div>
          </div>
        </div>

        {/* Insights Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          {analyticsQuery.analytics ? (
            <FinancialInsights
              velocity={resolvedVelocity}
              topCategories={resolvedTopCategories}
              healthScore={resolvedHealthScore}
            />
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-6">
              <p className="text-gray-500 text-sm">
                {analyticsQuery.isLoading
                  ? "Loading insights..."
                  : "No analytics data available for the selected range."}
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
    </div>
  );
};

export { AnalyticsDashboard };
export default AnalyticsDashboard;
