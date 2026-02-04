/**
 * Allocation Analytics Dashboard
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 *
 * Main container component for the allocation analytics dashboard.
 * Displays comprehensive visual analysis of paycheck allocation patterns.
 */

import { lazy, Suspense } from "react";
import Button from "@/components/ui/buttons/Button";
import { useAllocationAnalytics } from "@/hooks/platform/analytics/useAllocationAnalytics";
import {
  useAllocationAnalyticsStore,
  selectActiveTab,
  selectDateRange,
  selectAnalyticsTier,
} from "@/stores/ui/allocationAnalyticsStore";
import { useDatabase } from "@/contexts/DatabaseContext";
import logger from "@/utils/core/common/logger";

// Lazy load enhanced components (Tier 2)
const EnhancedOverviewTab = lazy(() =>
  import("./enhanced/EnhancedOverviewTab").then((m) => ({ default: m.EnhancedOverviewTab }))
);
const InteractiveHeatmapCalendar = lazy(() =>
  import("./enhanced/InteractiveHeatmapCalendar").then((m) => ({
    default: m.InteractiveHeatmapCalendar,
  }))
);
const EnvelopeAllocationTrendsChart = lazy(() =>
  import("./enhanced/EnvelopeAllocationTrendsChart").then((m) => ({
    default: m.EnvelopeAllocationTrendsChart,
  }))
);
const AllocationDistributionChart = lazy(() =>
  import("./enhanced/AllocationDistributionChart").then((m) => ({
    default: m.AllocationDistributionChart,
  }))
);
const StrategyPerformanceTable = lazy(() =>
  import("./enhanced/StrategyPerformanceTable").then((m) => ({
    default: m.StrategyPerformanceTable,
  }))
);
const HealthScoreGauge = lazy(() =>
  import("./enhanced/HealthScoreGauge").then((m) => ({ default: m.HealthScoreGauge }))
);

// Minimal components always loaded
import { MinimalOverviewTab } from "./minimal/MinimalOverviewTab";
import { SimpleHeatmapGrid } from "./minimal/SimpleHeatmapGrid";
import { BasicTrendsSparkline } from "./minimal/BasicTrendsSparkline";
import { DistributionTable } from "./minimal/DistributionTable";
import { MinimalHealthGauge } from "./minimal/MinimalHealthGauge";

// Demo components
import { PerformanceComparisonWidget } from "./demo/PerformanceComparisonWidget";
import { transformAnalyticsData } from "./utils/analyticsDataTransformers";

/**
 * Loading state component
 */
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
    </div>
  </div>
);

/**
 * Error state component
 */
interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Failed to Load Analytics
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
      <Button
        onClick={onRetry}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Try Again
      </Button>
    </div>
  </div>
);

/**
 * Empty state component (no data)
 */
const EmptyState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No Allocation Data Yet
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Start by processing your first paycheck to see allocation analytics and trends.
      </p>
      <Button
        onClick={() => {
          // Navigate to paycheck processing
          logger.info("Navigate to paycheck processing");
        }}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Process Paycheck
      </Button>
    </div>
  </div>
);

/**
 * Dashboard header with title and controls
 */
interface DashboardHeaderProps {
  totalAllocations: number;
  healthScore: number;
  dateRange: { start: string; end: string };
  isDemoMode?: boolean;
}

const DashboardHeader = ({
  totalAllocations,
  healthScore,
  dateRange,
  isDemoMode = false,
}: DashboardHeaderProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Allocation Analytics
            </h1>
            {isDemoMode && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                🎭 Demo Mode
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Paychecks Analyzed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAllocations}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
            <p
              className={`text-2xl font-bold ${
                healthScore >= 80
                  ? "text-green-600"
                  : healthScore >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {healthScore}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tab navigation component
 */
const TabNavigation = () => {
  const activeTab = useAllocationAnalyticsStore(selectActiveTab);
  const setActiveTab = useAllocationAnalyticsStore((state) => state.setActiveTab);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "heatmap", label: "Calendar", icon: "📅" },
    { id: "trends", label: "Trends", icon: "📈" },
    { id: "distribution", label: "Distribution", icon: "🥧" },
    { id: "strategy", label: "Strategy", icon: "🎯" },
    { id: "health", label: "Health", icon: "💚" },
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};

/**
 * Loading fallback for lazy components
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading enhanced analytics...</p>
    </div>
  </div>
);

/**
 * Tab content based on analytics tier and active tab
 */
interface TabContentProps {
  tab: string;
  tier: "offline" | "private-backend" | "cloud-sync";
  data: ReturnType<typeof useAllocationAnalytics>["data"];
}

type AnalyticsData = NonNullable<ReturnType<typeof useAllocationAnalytics>["data"]>;
type TransformedAnalyticsData = NonNullable<ReturnType<typeof transformAnalyticsData>>;

const OverviewContent = ({
  isEnhanced,
  data,
  transformed,
}: {
  isEnhanced: boolean;
  data: AnalyticsData;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <EnhancedOverviewTab
        totalAllocations={data.heatmap.totalAllocations}
        avgPerPaycheck={data.distribution.averagePerPaycheckCents}
        healthScore={data.healthScore.totalScore}
        frequency={data.heatmap.frequency}
        insights={transformed.mockMLInsights}
        anomalyCount={0}
      />
    </Suspense>
  ) : (
    <MinimalOverviewTab
      metrics={{
        totalAllocations: data.heatmap.totalAllocations,
        avgPerPaycheck: data.distribution.averagePerPaycheckCents,
        healthScore: data.healthScore.totalScore,
        frequency: data.heatmap.frequency,
      }}
    />
  );

const HeatmapContent = ({
  isEnhanced,
  transformed,
}: {
  isEnhanced: boolean;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <InteractiveHeatmapCalendar
        data={transformed.mockHeatmapData}
        onDateClick={(date) => logger.info("Date clicked", { date })}
      />
    </Suspense>
  ) : (
    <SimpleHeatmapGrid data={transformed.mockSimpleHeatmapData} />
  );

const TrendsContent = ({
  isEnhanced,
  data,
  transformed,
}: {
  isEnhanced: boolean;
  data: AnalyticsData;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <EnvelopeAllocationTrendsChart
        data={transformed.mockTrendData}
        selectedEnvelopes={[data.trends.envelopes[0]?.id || ""]}
        anomalies={transformed.mockAnomalies}
      />
    </Suspense>
  ) : (
    <BasicTrendsSparkline envelopes={transformed.mockEnvelopeSparklines} />
  );

const DistributionContent = ({
  isEnhanced,
  transformed,
}: {
  isEnhanced: boolean;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <AllocationDistributionChart
        data={transformed.mockDistributionData}
        viewMode="category"
        onViewModeChange={(mode) => logger.info("View mode changed", { mode })}
      />
    </Suspense>
  ) : (
    <DistributionTable data={transformed.mockCategoryDistribution} />
  );

const StrategyContent = ({
  isEnhanced,
  transformed,
}: {
  isEnhanced: boolean;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <StrategyPerformanceTable strategies={transformed.mockStrategyData} />
    </Suspense>
  ) : (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <p className="text-gray-600 dark:text-gray-400">
        Strategy analysis available in enhanced mode
      </p>
    </div>
  );

const HealthContent = ({
  isEnhanced,
  data,
  transformed,
}: {
  isEnhanced: boolean;
  data: AnalyticsData;
  transformed: TransformedAnalyticsData;
}) =>
  isEnhanced ? (
    <Suspense fallback={<LoadingFallback />}>
      <HealthScoreGauge
        score={data.healthScore.totalScore}
        components={transformed.mockHealthComponents}
        recommendations={transformed.mockMLInsights}
        trendData={transformed.mockHealthTrend}
      />
    </Suspense>
  ) : (
    <MinimalHealthGauge score={data.healthScore.totalScore} />
  );

const TabContent = ({ tab, tier, data }: TabContentProps) => {
  const isEnhanced = tier === "private-backend";

  if (!data) return null;

  // Convert data to format expected by enhanced components
  const transformed = transformAnalyticsData(data);

  if (!transformed) return null;

  switch (tab) {
    case "overview":
      return <OverviewContent isEnhanced={isEnhanced} data={data} transformed={transformed} />;
    case "heatmap":
      return <HeatmapContent isEnhanced={isEnhanced} transformed={transformed} />;
    case "trends":
      return <TrendsContent isEnhanced={isEnhanced} data={data} transformed={transformed} />;
    case "distribution":
      return <DistributionContent isEnhanced={isEnhanced} transformed={transformed} />;
    case "strategy":
      return <StrategyContent isEnhanced={isEnhanced} transformed={transformed} />;
    case "health":
      return <HealthContent isEnhanced={isEnhanced} data={data} transformed={transformed} />;
    default:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {tab.charAt(0).toUpperCase() + tab.slice(1)} content coming soon...
          </p>
        </div>
      );
  }
};

/**
 * Main Allocation Analytics Dashboard Component
 *
 * @example
 * ```tsx
 * <AllocationAnalyticsDashboard />
 * ```
 */
export const AllocationAnalyticsDashboard = () => {
  const activeTab = useAllocationAnalyticsStore(selectActiveTab);
  const dateRange = useAllocationAnalyticsStore(selectDateRange);
  const analyticsTier = useAllocationAnalyticsStore(selectAnalyticsTier);
  const { isDemoMode } = useDatabase();

  // Fetch analytics data
  const { data, isLoading, error, refetch } = useAllocationAnalytics({
    startDate: dateRange.start,
    endDate: dateRange.end,
    includeHeatmap: true,
    includeTrends: true,
    includeDistribution: true,
    includeStrategyAnalysis: true,
    includeHealthScore: true,
  });

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Empty state (no data)
  if (!data || data.heatmap.totalAllocations === 0) {
    return <EmptyState />;
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          totalAllocations={data.heatmap.totalAllocations}
          healthScore={data.healthScore.totalScore}
          dateRange={dateRange}
          isDemoMode={isDemoMode}
        />

        <TabNavigation />

        {/* Demo Mode: Performance Comparison Widget */}
        {isDemoMode && (
          <div className="mb-6">
            <PerformanceComparisonWidget transactionCount={data.heatmap.totalAllocations} />
          </div>
        )}

        <div className="mt-6">
          <TabContent tab={activeTab} tier={analyticsTier} data={data} />
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              Debug: Tier={analyticsTier}, {data.heatmap.totalAllocations} allocations, Health:{" "}
              {data.healthScore.totalScore}, Envelopes: {data.trends.envelopes.length}, Strategies:{" "}
              {data.strategyAnalysis.strategies.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationAnalyticsDashboard;
