/**
 * Utility functions for CSV and image exports
 * Extracted from useReportExporter hook to reduce complexity
 */

import logger from "@/utils/core/common/logger";

interface Transaction {
  date?: string;
  description?: string;
  amount?: number;
  category?: string;
  envelopeName?: string;
}

interface AnalyticsData {
  transactions?: Transaction[];
}

/**
 * Convert analytics data to CSV format
 */
export const convertToCSV = (analyticsData: AnalyticsData): string => {
  const csvData: (string | number)[][] = [];

  // Headers
  csvData.push(["Date", "Description", "Amount", "Category", "Envelope"]);

  // Add transaction data
  if (analyticsData?.transactions) {
    analyticsData.transactions.forEach((transaction) => {
      csvData.push([
        transaction.date || "",
        transaction.description || "",
        transaction.amount || 0,
        transaction.category || "Uncategorized",
        transaction.envelopeName || "None",
      ]);
    });
  }

  // Convert to CSV string
  return csvData
    .map((row) =>
      row
        .map((field) => (typeof field === "string" && field.includes(",") ? `"${field}"` : field))
        .join(",")
    )
    .join("\n");
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, fileName: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export chart as image using html2canvas
 */
export const exportChartAsImage = async (
  element: Element,
  chartName: string,
  html2canvas: (element: Element, options: Record<string, unknown>) => Promise<HTMLCanvasElement>
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });

    // Convert to blob and download
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `VioletVault-${chartName}-${new Date().toISOString().split("T")[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  } catch (error) {
    logger.warn(`Failed to export chart: ${chartName}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get all chart elements from the page
 */
export const getChartElements = (): Element[] => {
  return Array.from(document.querySelectorAll("[data-chart-export]"));
};
