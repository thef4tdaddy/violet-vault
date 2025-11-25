import type { ReactNode } from "react";
import { AnalyticsData } from "@/types/analytics";
import OverviewTab from "../tabs/OverviewTab";
import TrendsTab from "../tabs/TrendsTab";
import HealthTab from "../tabs/HealthTab";
import CategoriesTab, { type CategoriesTabProps } from "../tabs/CategoriesTab";
import PerformanceMonitor from "../PerformanceMonitor";
import EnvelopesTab, {
  type EnvelopeSpendingEntry,
  type BudgetVsActualEntry,
  type EnvelopeBalanceEntry,
  type EnvelopeHealthEntry,
} from "../tabs/EnvelopesTab";

/**
 * Tab content renderer for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
interface TabContentProps {
  activeTab: string;
  chartType: "line" | "bar" | "area";
  handleChartTypeChange: (type: string) => void;
  monthlyTrends?: unknown[];
  envelopeSpending?: EnvelopeSpendingEntry[];
  weeklyPatterns?: unknown[];
  envelopeHealth?: EnvelopeHealthEntry[];
  budgetVsActual?: BudgetVsActualEntry[];
  categoryBreakdown?: CategoriesTabProps["categoryBreakdown"];
  selectedCategory?: string | null;
  onCategorySelect?: (name: string | null) => void;
  categoryTransactions?: CategoriesTabProps["categoryTransactions"];
  analyticsData?: AnalyticsData | null;
  balanceData?: Record<string, unknown> | null;
  envelopes?: EnvelopeBalanceEntry[];
  emptyState?: ReactNode;
}

const TabContent = ({
  activeTab,
  chartType,
  handleChartTypeChange,
  monthlyTrends,
  envelopeSpending,
  weeklyPatterns,
  envelopeHealth,
  budgetVsActual,
  categoryBreakdown,
  selectedCategory,
  onCategorySelect,
  categoryTransactions,
  analyticsData,
  balanceData,
  envelopes,
}: TabContentProps) => {
  if (activeTab === "overview") {
    return <OverviewTab monthlyTrends={monthlyTrends} envelopeSpending={envelopeSpending} />;
  }

  if (activeTab === "spending") {
    return (
      <CategoriesTab
        categoryBreakdown={categoryBreakdown}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        categoryTransactions={categoryTransactions}
      />
    );
  }

  if (activeTab === "trends") {
    return (
      <TrendsTab
        chartType={chartType}
        handleChartTypeChange={handleChartTypeChange}
        monthlyTrends={
          monthlyTrends as
            | Array<{ month: string; value: number; [key: string]: unknown }>
            | null
            | undefined
        }
        weeklyPatterns={
          weeklyPatterns as
            | Array<{ day: string; amount: number; [key: string]: unknown }>
            | null
            | undefined
        }
      />
    );
  }

  if (activeTab === "health") {
    return (
      <HealthTab
        envelopeHealth={
          envelopeHealth as
            | Array<{
                name: string;
                id?: string;
                status?: string;
                currentBalance?: number;
                monthlyBudget?: number;
                healthScore?: number;
              }>
            | null
            | undefined
        }
        budgetVsActual={budgetVsActual as Array<{ [key: string]: unknown }> | null | undefined}
      />
    );
  }

  if (activeTab === "performance") {
    return <PerformanceMonitor analyticsData={analyticsData} balanceData={balanceData} />;
  }

  if (activeTab === "envelopes") {
    return (
      <EnvelopesTab
        envelopeSpending={envelopeSpending}
        budgetVsActual={budgetVsActual}
        envelopes={envelopes}
        envelopeHealth={envelopeHealth}
      />
    );
  }

  return null;
};

export default TabContent;
