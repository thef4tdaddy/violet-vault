import { useCallback } from "react";

/**
 * Hook for handling analytics data export functionality
 * Extracts export logic from components
 */
export const useAnalyticsExport = () => {
  const exportAnalyticsData = useCallback((data, currentUser) => {
    const { dateRange, metrics, monthlyTrends, envelopeSpending, categoryBreakdown } = data;

    const dataToExport = {
      dateRange,
      metrics,
      monthlyTrends,
      envelopeSpending,
      categoryBreakdown,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.userName || "Anonymous",
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportAnalyticsData,
  };
};
