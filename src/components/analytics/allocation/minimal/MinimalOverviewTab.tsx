import React from "react";
import { MetricCard } from "@/components/primitives/cards/MetricCard";

export interface AllocationMetrics {
  totalAllocations: number;
  avgPerPaycheck: number;
  healthScore: number;
  frequency: string;
}

export interface MinimalOverviewTabProps {
  metrics: AllocationMetrics;
  loading?: boolean;
}

/**
 * Minimal Overview Tab Component
 *
 * Displays key allocation metrics using MetricCard primitives.
 * Lightweight, offline-first component with no external dependencies.
 *
 * Features:
 * - Total allocations metric
 * - Average per paycheck metric
 * - Health score gauge (0-100)
 * - Frequency indicator
 * - Responsive grid layout
 * - Loading states
 *
 * Target: ~5KB
 *
 * @example
 * ```tsx
 * <MinimalOverviewTab
 *   metrics={{
 *     totalAllocations: 2500,
 *     avgPerPaycheck: 1250,
 *     healthScore: 85,
 *     frequency: "Bi-weekly"
 *   }}
 * />
 * ```
 */
export const MinimalOverviewTab: React.FC<MinimalOverviewTabProps> = ({
  metrics,
  loading = false,
}) => {
  // Determine health score variant based on score
  const getHealthVariant = (
    score: number
  ): "default" | "success" | "warning" | "danger" | "info" => {
    if (score >= 90) return "success"; // Excellent
    if (score >= 75) return "info"; // Good
    if (score >= 60) return "warning"; // Fair
    return "danger"; // Poor
  };

  // Determine health status text
  const getHealthStatus = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Attention";
  };

  const healthVariant = getHealthVariant(metrics.healthScore);
  const healthStatus = getHealthStatus(metrics.healthScore);

  return (
    <div
      className="space-y-6"
      role="region"
      aria-label="Allocation Overview"
      data-testid="minimal-overview-tab"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocations */}
        <MetricCard
          title="Total Allocations"
          value={metrics.totalAllocations}
          format="currency"
          icon="DollarSign"
          variant="info"
          subtitle="All time"
          loading={loading}
        />

        {/* Average Per Paycheck */}
        <MetricCard
          title="Avg Per Paycheck"
          value={metrics.avgPerPaycheck}
          format="currency"
          icon="TrendingUp"
          variant="default"
          subtitle="Average amount"
          loading={loading}
        />

        {/* Health Score */}
        <MetricCard
          title="Health Score"
          value={metrics.healthScore}
          format="number"
          icon="Activity"
          variant={healthVariant}
          subtitle={healthStatus}
          loading={loading}
        />

        {/* Frequency */}
        <MetricCard
          title="Frequency"
          value={metrics.frequency}
          format="custom"
          icon="Calendar"
          variant="default"
          subtitle="Payment schedule"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MinimalOverviewTab;
