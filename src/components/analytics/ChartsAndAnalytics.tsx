import { useCallback, useMemo, useState } from "react";
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { useChartsAnalytics } from "@/hooks/analytics/useChartsAnalytics";
import { useAnalyticsExport } from "@/hooks/analytics/useAnalyticsExport";
import AnalyticsHeader from "./components/AnalyticsHeader";
import MetricsGrid from "./components/MetricsGrid";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";

interface ExternalEnvelopeBreakdown {
  envelopeId?: string;
  monthlyBudget?: number;
  remaining?: number;
  color?: string;
  spending?: number;
}

interface ExternalAnalyticsData {
  transactions?: unknown[];
  envelopeBreakdown?: Record<string, ExternalEnvelopeBreakdown>;
}

const ChartsAnalytics = ({
  transactions = [],
  envelopes = [],
  analyticsData: externalAnalytics,
  currentUser = { userName: "User", userColor: "#a855f7" },
  timeFilter = "3months",
  focus = "overview",
}: {
  transactions?: unknown[];
  envelopes?: unknown[];
  analyticsData?: ExternalAnalyticsData | null;
  currentUser?: { userName: string; userColor: string };
  timeFilter?: string;
  focus?: string;
}) => {
  const { exportAnalyticsData } = useAnalyticsExport();
  const {
    activeTab,
    chartType,
    dateRange,
    handleDateRangeChange,
    handleChartTypeChange,
    handleTabChange,
  } = useChartsAnalytics(timeFilter, focus);

  const normalizedTransactions = useMemo(() => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      return transactions;
    }

    if (
      externalAnalytics &&
      Array.isArray((externalAnalytics as Record<string, unknown>).transactions)
    ) {
      return (externalAnalytics as Record<string, unknown>).transactions as unknown[];
    }

    return [];
  }, [transactions, externalAnalytics]);

  const normalizedEnvelopes = useMemo(() => {
    if (Array.isArray(envelopes) && envelopes.length > 0) {
      return envelopes;
    }

    if (
      externalAnalytics &&
      externalAnalytics.envelopeBreakdown &&
      typeof externalAnalytics.envelopeBreakdown === "object"
    ) {
      return Object.entries(externalAnalytics.envelopeBreakdown).map(([name, data]) => {
        const envelopeData = (data || {}) as ExternalEnvelopeBreakdown;
        return {
          id: envelopeData.envelopeId || name,
          name,
          currentBalance: envelopeData.remaining ?? 0,
          targetAmount: envelopeData.monthlyBudget ?? 0,
          color: envelopeData.color,
        };
      });
    }

    return [];
  }, [envelopes, externalAnalytics]);

  const analyticsData = useAnalyticsData({
    transactions: normalizedTransactions as unknown[],
    envelopes: normalizedEnvelopes as unknown[],
    timeFilter: dateRange || timeFilter,
  });

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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
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

  const handleCategorySelect = useCallback((name: string | null) => {
    setSelectedCategory((previous) => (previous === name ? null : name));
  }, []);

  const categoryTransactions = useMemo(() => {
    if (!activeCategory) {
      return [];
    }

    if (!Array.isArray(filteredTransactions)) {
      return [];
    }

    return filteredTransactions.filter((transaction) => {
      const categoryName =
        (transaction && typeof transaction === "object" && "category" in transaction
          ? (transaction as Record<string, unknown>).category
          : null) || "Uncategorized";

      if (categoryName !== activeCategory) {
        return false;
      }

      const amount =
        transaction && typeof transaction === "object" && "amount" in transaction
          ? Number((transaction as Record<string, unknown>).amount)
          : 0;

      return amount < 0;
    });
  }, [filteredTransactions, activeCategory]);

  // Check if we have any transaction data
  const effectiveEnvelopes = useMemo(
    () =>
      Array.isArray(envelopes) && envelopes.length > 0 ? envelopes : normalizedEnvelopes,
    [envelopes, normalizedEnvelopes]
  );

  const metricsEnvelopes = useMemo(
    () =>
      (Array.isArray(effectiveEnvelopes) ? effectiveEnvelopes : []).map((envelope) => {
        const envelopeRecord = envelope as Record<string, unknown>;
        const id =
          (envelopeRecord.id as string) ||
          (envelopeRecord.envelopeId as string) ||
          String(envelopeRecord.name ?? "envelope");
        return {
          id,
          name: String(envelopeRecord.name ?? "Envelope"),
          balance: Number(
            envelopeRecord.balance ??
              envelopeRecord.currentBalance ??
              envelopeRecord.available ??
              envelopeRecord.remaining ??
              0
          ),
          budgetedAmount: Number(
            envelopeRecord.budgetedAmount ??
              envelopeRecord.monthlyBudget ??
              envelopeRecord.targetAmount ??
              0
          ),
          type: (envelopeRecord.type as "bill" | "variable" | "savings") || "variable",
        };
      }),
    [effectiveEnvelopes]
  );

  const hasTransactions =
    Array.isArray(normalizedTransactions) && normalizedTransactions.length > 0;
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
        envelopes={metricsEnvelopes as import("@/types/analytics").Envelope[]}
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
        selectedCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        categoryTransactions={categoryTransactions}
      />
    </div>
  );
};

export default ChartsAnalytics;
