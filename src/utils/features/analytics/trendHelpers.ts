import { formatCurrency } from "./categoryHelpers";
export { formatCurrency };

/**
 * Utility functions for trend analysis formatting and calculations
 */

/**
 * Format percentage values for display
 */
export const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value}%`;

/**
 * Get trend icon and styling based on trend direction
 */
export const getTrendIconConfig = (trend: string) => {
  switch (trend) {
    case "increasing":
      return {
        bgClass: "bg-red-100",
        iconColor: "text-red-600",
        iconType: "trending-up",
      };
    case "decreasing":
      return {
        bgClass: "bg-green-100",
        iconColor: "text-green-600",
        iconType: "trending-down",
      };
    default:
      return {
        bgClass: "bg-gray-100",
        iconColor: "text-gray-600",
        iconType: "bar-chart",
      };
  }
};

/**
 * Get color configuration for growth rate display
 */
export const getGrowthRateColor = (growthRate: number) => {
  return growthRate > 0 ? "text-red-600" : "text-green-600";
};

/**
 * Generate dynamic category chart colors
 */
export const getCategoryChartColor = (index: number) => {
  return `hsl(${index * 60}, 70%, 50%)`;
};

/**
 * Common chart configuration for responsiveness
 */
export const getChartConfig = (height = "100%") => ({
  width: "100%",
  height,
});

/**
 * Common tooltip formatter for currency values
 */
export const currencyTooltipFormatter = (value: number, name: string): [string, string] => [
  formatCurrency(value),
  name,
];

/**
 * Tooltip formatter for percentage change
 */
export const velocityTooltipFormatter = (value: number, name: string): [string, string] => [
  name === "percentChange" ? formatPercent(value) : formatCurrency(value),
  name === "percentChange" ? "Rate of Change" : "Amount Change",
];

/**
 * Chart styling constants
 */
export const CHART_COLORS = {
  INCOME: "#10B981",
  SPENDING: "#EF4444",
  NET: "#6366F1",
  VELOCITY: "#8B5CF6",
};

/**
 * Season color mapping
 */
export const SEASON_COLORS = {
  Winter: "#3B82F6",
  Spring: "#10B981",
  Summer: "#F59E0B",
  Fall: "#EF4444",
};

/**
 * Get trend icon emoji based on direction
 */
export const getTrendIcon = (direction: string) => {
  const icons = {
    increasing: "📈",
    decreasing: "📉",
    stable: "➡️",
  };
  return icons[direction as keyof typeof icons] || icons.stable;
};

/**
 * Get CSS color class based on trend direction
 */
export const getTrendColor = (direction: string) => {
  const colors = {
    increasing: "text-red-600",
    decreasing: "text-green-600",
    stable: "text-gray-600",
  };
  return colors[direction as keyof typeof colors] || colors.stable;
};

/**
 * Get health score background color class
 */
export const getHealthColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

/**
 * Get health score label
 */
export const getHealthLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
};
