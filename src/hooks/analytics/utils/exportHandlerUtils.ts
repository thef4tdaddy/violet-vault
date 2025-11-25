/**
 * Utility functions for export templates and handlers
 * Extracted from useReportExporter hook to reduce complexity
 */

import logger from "../../../utils/common/logger";
import { globalToast } from "../../../stores/ui/toastStore";

interface ExportOptions {
  includeSummary: boolean;
  includeCharts: boolean;
  includeTransactions: boolean;
  includeEnvelopes: boolean;
  includeSavings: boolean;
  includeInsights: boolean;
  customDateRange: unknown;
}

/**
 * Get template options for different report types
 */
export const getTemplateOptions = (template: string): Partial<ExportOptions> | null => {
  const templateOptions: Record<string, Partial<ExportOptions>> = {
    executive: {
      includeSummary: true,
      includeCharts: false,
      includeTransactions: false,
      includeEnvelopes: false,
      includeSavings: false,
      includeInsights: true,
    },
    detailed: {
      includeSummary: true,
      includeCharts: true,
      includeTransactions: true,
      includeEnvelopes: true,
      includeSavings: true,
      includeInsights: true,
    },
    budget: {
      includeSummary: true,
      includeCharts: false,
      includeTransactions: false,
      includeEnvelopes: true,
      includeSavings: false,
      includeInsights: true,
    },
    trends: {
      includeSummary: false,
      includeCharts: true,
      includeTransactions: false,
      includeEnvelopes: false,
      includeSavings: false,
      includeInsights: true,
    },
  };

  return templateOptions[template] || null;
};

/**
 * Execute export based on format
 */
export const executeExport = async (
  format: string,
  handlers: {
    exportToPDF: (a: unknown, b: unknown, t: unknown) => Promise<void>;
    exportToCSV: (a: unknown) => Promise<void>;
    exportChartImages: () => Promise<void>;
  },
  data: {
    analyticsData: unknown;
    balanceData: unknown;
    timeFilter: unknown;
  }
): Promise<void> => {
  switch (format) {
    case "pdf":
      await handlers.exportToPDF(data.analyticsData, data.balanceData, data.timeFilter);
      break;
    case "csv":
      await handlers.exportToCSV(data.analyticsData);
      break;
    case "png":
      await handlers.exportChartImages();
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Handle export completion
 */
export const handleExportComplete = (
  format: string,
  exportOptions: ExportOptions,
  onExport?: (format: string, options: ExportOptions) => void,
  onClose?: () => void
): void => {
  logger.info("Export completed successfully");
  globalToast.showSuccess(`${format.toUpperCase()} export completed!`, "Export Successful");
  onExport?.(format, exportOptions);
  onClose?.();
};

/**
 * Handle export error
 */
export const handleExportError = (error: unknown): void => {
  logger.error("Export failed", error);
  globalToast.showError("Export failed. Please try again.", "Export Failed", 8000);
};
