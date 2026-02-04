/**
 * Performance Monitor utility functions
 * Extracted from PerformanceMonitor.jsx for better organization
 */

/**
 * Get color classes for performance score display
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600 bg-green-100";
  if (score >= 70) return "text-blue-600 bg-blue-100";
  if (score >= 50) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

/**
 * Get background color classes for performance score bars
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Get performance message based on overall score
 */
export const getPerformanceMessage = (score: number): string => {
  if (score >= 90) {
    return "Excellent financial management with strong performance across all areas";
  }
  if (score >= 70) {
    return "Good financial health with opportunities for optimization";
  }
  if (score >= 50) {
    return "Fair financial standing that could benefit from focused improvements";
  }
  return "Financial health needs immediate attention and strategic planning";
};

export interface IconType {
  name: string;
  color: string;
}

/**
 * Get alert icon type based on alert type
 */
export const getAlertIconType = (type: string): IconType => {
  switch (type) {
    case "error":
      return { name: "AlertTriangle", color: "text-red-500" };
    case "warning":
      return { name: "AlertTriangle", color: "text-yellow-500" };
    case "info":
      return { name: "CheckCircle", color: "text-blue-500" };
    default:
      return { name: "CheckCircle", color: "text-green-500" };
  }
};

/**
 * Get recommendation icon type based on recommendation type
 */
export const getRecommendationIconType = (type: string): IconType => {
  switch (type) {
    case "success":
    case "saving":
      return { name: "CheckCircle", color: "text-green-500" };
    case "info":
    case "investment":
      return { name: "TrendingUp", color: "text-blue-500" };
    case "warning":
    case "spending":
      return { name: "AlertTriangle", color: "text-yellow-500" };
    case "tip":
      return { name: "Zap", color: "text-purple-500" };
    default:
      return { name: "CheckCircle", color: "text-green-500" };
  }
};
