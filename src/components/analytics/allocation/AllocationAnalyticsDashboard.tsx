/**
 * Allocation Analytics Dashboard
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 *
 * Main container component for the allocation analytics dashboard.
 * Displays comprehensive visual analysis of paycheck allocation patterns.
 */

import Button from "@/components/ui/buttons/Button";
import { useAllocationAnalytics } from "@/hooks/platform/analytics/useAllocationAnalytics";
import {
  useAllocationAnalyticsStore,
  selectActiveTab,
  selectDateRange,
} from "@/stores/ui/allocationAnalyticsStore";
import logger from "@/utils/core/common/logger";

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
}

const DashboardHeader = ({ totalAllocations, healthScore, dateRange }: DashboardHeaderProps) => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Allocation Analytics</h1>
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
 * Placeholder content for tabs (will be replaced with actual components)
 */
const TabContent = ({ tab }: { tab: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
    <p className="text-gray-600 dark:text-gray-400">
      {tab.charAt(0).toUpperCase() + tab.slice(1)} content coming soon...
    </p>
  </div>
);

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
        />

        <TabNavigation />

        <div className="mt-6">
          <TabContent tab={activeTab} />
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              Debug: {data.heatmap.totalAllocations} allocations, Health:{" "}
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
