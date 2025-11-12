import { useState, useMemo, useCallback } from "react";
import useAnalytics from "@/hooks/analytics/useAnalytics";
import ReportExporter from "./ReportExporter";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsDashboardHeader from "./dashboard/AnalyticsDashboardHeader";
import AnalyticsTabNavigation from "./dashboard/AnalyticsTabNavigation";
import AnalyticsLoadingState from "./dashboard/AnalyticsLoadingState";
import AnalyticsErrorState from "./dashboard/AnalyticsErrorState";
import TabContent from "./components/TabContent";
import { FinancialInsights } from "./insights";
import type { VelocityData, TopCategory } from "./insights/FinancialInsights";
import type {
  EnvelopeBalanceEntry,
  EnvelopeSpendingEntry,
  EnvelopeHealthEntry,
  BudgetVsActualEntry,
} from "./tabs/EnvelopesTab";
import logger from "@/utils/common/logger";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";

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

type NormalizedEnvelope = {
  id: string;
  name: string;
  currentBalance: number;
  targetAmount: number;
  color?: unknown;
};

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "spending" | "trends" | "health" | "performance" | "envelopes"
  >("overview");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [timeFilter, setTimeFilter] = useState("allTime");
  const [customDateRange] = useState<{ start: string | Date; end: string | Date } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get budget data from TanStack Query
  const { transactions = [] } = useTransactions();
  const { envelopes = [] } = useEnvelopes();

  // Analytics data with current filters
  const analyticsQuery = useAnalytics({
    period: timeFilter,
    customDateRange: customDateRange || undefined,
    includeTransfers: false,
    groupBy: "category",
  });

  const balanceQuery = useAnalytics({
    period: timeFilter,
    customDateRange: customDateRange || undefined,
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

  const normalizedTransactions = useMemo(() => {
    const fromAnalytics = (analyticsQuery.analytics as { transactions?: unknown[] })?.transactions;
    if (Array.isArray(fromAnalytics) && fromAnalytics.length > 0) {
      return fromAnalytics as unknown[];
    }
    return transactions;
  }, [analyticsQuery.analytics, transactions]);

  const normalizedEnvelopes = useMemo<NormalizedEnvelope[]>(() => {
    const breakdown = (
      analyticsQuery.analytics as {
        envelopeBreakdown?: Record<string, Record<string, unknown>>;
      }
    )?.envelopeBreakdown;

    if (breakdown && typeof breakdown === "object") {
      return Object.entries(breakdown).map(([name, data]) => {
        const entry = data || {};
        const envelopeId =
          (entry.envelopeId as string | undefined) || (entry.id as string | undefined) || name;

        return {
          id: envelopeId,
          name,
          currentBalance: Number(entry.remaining ?? entry.currentBalance ?? 0),
          targetAmount: Number(entry.monthlyBudget ?? entry.targetAmount ?? 0),
          color: entry.color,
        };
      });
    }

    return (envelopes as unknown as NormalizedEnvelope[]) || [];
  }, [analyticsQuery.analytics, envelopes]);

  const analyticsData = useAnalyticsData({
    transactions: (normalizedTransactions as unknown[]) || [],
    envelopes: (normalizedEnvelopes as unknown[]) || [],
    timeFilter,
  });

  const {
    filteredTransactions = [],
    monthlyTrends = [],
    envelopeSpending = [],
    categoryBreakdown = [],
    weeklyPatterns: computedWeeklyPatterns = [],
    envelopeHealth = [],
    budgetVsActual: computedBudgetVsActual = [],
  } = analyticsData || {};

  const summaryMetrics = useMemo(
    () => calculateSummaryMetrics(analyticsQuery.analytics, balanceQuery.analytics),
    [analyticsQuery.analytics, balanceQuery.analytics]
  );

  const externalWeeklyPatterns = useMemo(() => {
    const weekly = (
      analyticsQuery.analytics as unknown as { weeklyPatterns?: Array<Record<string, unknown>> }
    )?.weeklyPatterns;
    if (!Array.isArray(weekly)) {
      return null;
    }

    const normalized = weekly.map((entry) => {
      const record = entry || {};
      return {
        ...record,
        day: String(record.day ?? record.name ?? ""),
        amount: Number(record.amount ?? 0),
      };
    });

    const hasData = normalized.some((item) => Number(item.amount) !== 0);
    return hasData ? normalized : null;
  }, [analyticsQuery.analytics]);

  const externalBudgetVsActual = useMemo(() => {
    const budget = (
      analyticsQuery.analytics as unknown as { budgetVsActual?: Array<Record<string, unknown>> }
    )?.budgetVsActual;
    if (!Array.isArray(budget)) {
      return null;
    }

    const normalized = budget.map((entry) => {
      const record = entry || {};
      return {
        ...record,
        name: String(record.name ?? record.envelope ?? "Envelope"),
        budgeted: Number(record.budgeted ?? record.planned ?? 0),
        actual: Number(record.actual ?? record.spent ?? 0),
      };
    });

    const hasData = normalized.some(
      (item) => Number(item.budgeted) !== 0 || Number(item.actual) !== 0
    );

    return hasData ? normalized : null;
  }, [analyticsQuery.analytics]);

  const weeklyPatterns = useMemo(() => {
    if (externalWeeklyPatterns) {
      return externalWeeklyPatterns;
    }
    return computedWeeklyPatterns;
  }, [externalWeeklyPatterns, computedWeeklyPatterns]);

  const budgetVsActual = useMemo(() => {
    if (externalBudgetVsActual) {
      return externalBudgetVsActual;
    }
    return computedBudgetVsActual;
  }, [externalBudgetVsActual, computedBudgetVsActual]);

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

  const resolvedSelectedCategory = useMemo(() => {
    if (!selectedCategory) {
      return null;
    }

    if (!Array.isArray(categoryBreakdown)) {
      return null;
    }

    return categoryBreakdown.some((entry) => entry?.name === selectedCategory)
      ? selectedCategory
      : null;
  }, [selectedCategory, categoryBreakdown]);

  const categoryTransactions = useMemo(() => {
    if (!resolvedSelectedCategory) {
      return [];
    }

    if (!Array.isArray(filteredTransactions)) {
      return [];
    }

    return filteredTransactions.filter((transaction) => {
      const record = transaction as Record<string, unknown>;
      const category =
        (record && typeof record === "object" && record.category) ||
        (record && typeof record === "object" && record.categoryName) ||
        "Uncategorized";

      if (category !== resolvedSelectedCategory) {
        return false;
      }

      const amount = Number(record.amount ?? 0);
      return amount < 0;
    }) as Array<Record<string, unknown>>;
  }, [filteredTransactions, resolvedSelectedCategory]);

  const handleCategorySelect = useCallback((name: string | null) => {
    setSelectedCategory((previous) => (previous === name ? null : name));
  }, []);

  const handleChartTypeChange = useCallback((type: string) => {
    if (type === "line" || type === "bar" || type === "area") {
      setChartType(type);
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (
      tab === "overview" ||
      tab === "spending" ||
      tab === "trends" ||
      tab === "health" ||
      tab === "performance" ||
      tab === "envelopes"
    ) {
      setActiveTab(tab);
    }
  }, []);

  const handleExport = () => {
    try {
      // Export logic here
    } catch (error) {
      logger.error("Export failed:", error);
    }
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
              <AnalyticsTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
              <div className="px-6 pb-6 pt-5">
                <TabContent
                  activeTab={activeTab}
                  chartType={chartType}
                  handleChartTypeChange={handleChartTypeChange}
                  monthlyTrends={monthlyTrends}
                  envelopeSpending={envelopeSpending as unknown as EnvelopeSpendingEntry[]}
                  weeklyPatterns={weeklyPatterns}
                  envelopeHealth={envelopeHealth as unknown as EnvelopeHealthEntry[]}
                  budgetVsActual={budgetVsActual as unknown as BudgetVsActualEntry[]}
                  categoryBreakdown={categoryBreakdown}
                  selectedCategory={resolvedSelectedCategory}
                  onCategorySelect={handleCategorySelect}
                  categoryTransactions={categoryTransactions}
                  analyticsData={
                    analyticsQuery.analytics && typeof analyticsQuery.analytics === "object"
                      ? (analyticsQuery.analytics as Record<string, unknown>)
                      : null
                  }
                  balanceData={
                    balanceQuery.analytics && typeof balanceQuery.analytics === "object"
                      ? (balanceQuery.analytics as Record<string, unknown>)
                      : null
                  }
                  envelopes={normalizedEnvelopes as unknown as EnvelopeBalanceEntry[]}
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
            analyticsData={{
              balanceData: balanceQuery.analytics,
              categoryData: analyticsQuery.analytics,
              transactionData: analyticsQuery.analytics,
              envelopeData: analyticsQuery.analytics,
              savingsData: analyticsQuery.analytics,
            }}
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
