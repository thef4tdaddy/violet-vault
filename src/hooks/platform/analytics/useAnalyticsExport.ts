import { useCallback } from "react";

interface AnalyticsData {
  dateRange: unknown;
  metrics: unknown;
  monthlyTrends: unknown;
  envelopeSpending: unknown;
  categoryBreakdown: unknown;
}

interface CurrentUser {
  userName?: string;
}

/**
 * Hook for handling analytics data export functionality
 * Extracts export logic from components
 */
export const useAnalyticsExport = () => {
  const exportAnalyticsData = useCallback(
    (data: AnalyticsData, currentUser: CurrentUser | null) => {
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
    },
    []
  );

  return {
    exportAnalyticsData,
  };
};
