/**
 * Allocation Insights Component
 * Displays smart insights on Success Step
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import React from "react";
import type { Insight } from "@/types/allocation-comparison";

interface AllocationInsightsProps {
  insights: Insight[];
}

/**
 * Get icon for insight type
 */
const getInsightIcon = (type: Insight["type"]): string => {
  switch (type) {
    case "trend":
      return "📈";
    case "goal_progress":
      return "🎯";
    case "anomaly":
      return "ℹ️";
    case "suggestion":
      return "💡";
    default:
      return "ℹ️";
  }
};

/**
 * Get background color for severity
 */
const getSeverityBgColor = (severity: Insight["severity"]): string => {
  switch (severity) {
    case "success":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-amber-50 border-amber-200";
    case "info":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-slate-50 border-slate-200";
  }
};

/**
 * Get text color for severity
 */
const getSeverityTextColor = (severity: Insight["severity"]): string => {
  switch (severity) {
    case "success":
      return "text-green-900";
    case "warning":
      return "text-amber-900";
    case "info":
      return "text-blue-900";
    default:
      return "text-slate-900";
  }
};

export const AllocationInsights: React.FC<AllocationInsightsProps> = ({ insights }) => {
  if (insights.length === 0) {
    return null;
  }

  // Group insights by severity
  const successInsights = insights.filter((i) => i.severity === "success");
  const warningInsights = insights.filter((i) => i.severity === "warning");
  const infoInsights = insights.filter((i) => i.severity === "info");

  return (
    <div className="space-y-4">
      <h3 className="font-black text-slate-900 text-lg">📊 ALLOCATION INSIGHTS</h3>

      {/* Success insights */}
      {successInsights.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-green-700 text-sm">🎉 Positive Trends</h4>
          {successInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg hard-border ${getSeverityBgColor(insight.severity)}`}
            >
              <p className={`text-sm ${getSeverityTextColor(insight.severity)}`}>
                {getInsightIcon(insight.type)} {insight.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Warning insights */}
      {warningInsights.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-amber-700 text-sm">⚠️ Watch These Categories</h4>
          {warningInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg hard-border ${getSeverityBgColor(insight.severity)}`}
            >
              <p className={`text-sm ${getSeverityTextColor(insight.severity)}`}>
                {getInsightIcon(insight.type)} {insight.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info insights */}
      {infoInsights.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-blue-700 text-sm">💡 Suggestions</h4>
          {infoInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg hard-border ${getSeverityBgColor(insight.severity)}`}
            >
              <p className={`text-sm ${getSeverityTextColor(insight.severity)}`}>
                {getInsightIcon(insight.type)} {insight.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllocationInsights;
