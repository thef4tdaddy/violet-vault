/**
 * Enhanced Overview Tab Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Advanced overview with ML insights and anomaly detection
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React from "react";
import { MetricCard } from "@/components/primitives/cards/MetricCard";
import type { MLInsight } from "@/types/analyticsEnhanced";
import { getIcon } from "@/utils";

export interface EnhancedOverviewTabProps {
  totalAllocations: number;
  avgPerPaycheck: number;
  healthScore: number;
  frequency: string;
  insights: MLInsight[];
  anomalyCount: number;
}

/**
 * Insight Card Component
 */
interface InsightCardProps {
  insight: MLInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const iconMap = {
    warning: "AlertTriangle",
    success: "CheckCircle",
    info: "Info",
  };

  const colorMap = {
    warning: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
    success: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  };

  const textColorMap = {
    warning: "text-amber-700 dark:text-amber-300",
    success: "text-emerald-700 dark:text-emerald-300",
    info: "text-blue-700 dark:text-blue-300",
  };

  const Icon = getIcon(iconMap[insight.type]);

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${colorMap[insight.type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={textColorMap[insight.type]}>
          <Icon className="h-5 w-5 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${textColorMap[insight.type]}`}>{insight.title}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{insight.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Confidence: {insight.confidence}%
            </span>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${insight.type === "warning" ? "bg-amber-500" : insight.type === "success" ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * EnhancedOverviewTab Component
 *
 * Displays key metrics with ML-powered insights and anomaly alerts
 *
 * @example
 * ```tsx
 * <EnhancedOverviewTab
 *   totalAllocations={100}
 *   avgPerPaycheck={2500}
 *   healthScore={85}
 *   frequency="Bi-weekly"
 *   insights={mlInsights}
 *   anomalyCount={2}
 * />
 * ```
 */
export const EnhancedOverviewTab: React.FC<EnhancedOverviewTabProps> = ({
  totalAllocations,
  avgPerPaycheck,
  healthScore,
  frequency,
  insights,
  anomalyCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Allocations"
          value={totalAllocations}
          format="number"
          icon="DollarSign"
          variant="info"
          subtitle="Paychecks processed"
        />
        <MetricCard
          title="Avg Per Paycheck"
          value={avgPerPaycheck / 100}
          format="currency"
          icon="TrendingUp"
          variant="success"
          subtitle="Average allocation"
        />
        <MetricCard
          title="Health Score"
          value={healthScore}
          format="number"
          icon="Heart"
          variant={healthScore >= 80 ? "success" : healthScore >= 60 ? "warning" : "danger"}
          subtitle={`${healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs attention"}`}
        />
        <MetricCard
          title="Frequency"
          value={frequency}
          format="custom"
          icon="Calendar"
          variant="default"
          subtitle="Payment schedule"
        />
      </div>

      {/* Anomaly Alert Banner */}
      {anomalyCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-red-600 dark:text-red-400">
              {React.createElement(getIcon("AlertCircle"), { className: "h-6 w-6" })}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 dark:text-red-300">
                {anomalyCount} Anomal{anomalyCount === 1 ? "y" : "ies"} Detected
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                We detected unusual allocation patterns in your data. Check the Trends tab for more
                details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ML Insights Panel */}
      <div className="col-span-full">
        <div className="flex items-center gap-2 mb-4">
          {React.createElement(getIcon("Sparkles"), {
            className: "h-5 w-5 text-purple-600 dark:text-purple-400",
          })}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Insights</h3>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <InsightCard key={`${insight.title}-${index}`} insight={insight} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              No insights available yet. Process more paychecks to unlock AI-powered
              recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedOverviewTab;
