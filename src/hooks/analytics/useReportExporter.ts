import { useState, useCallback } from "react";
import logger from "../../utils/common/logger";
import {
  convertToCSV,
  downloadCSV,
  exportChartAsImage,
  getChartElements,
} from "./utils/csvImageExportUtils";
import {
  getTemplateOptions,
  executeExport,
  handleExportComplete,
  handleExportError,
} from "./utils/exportHandlerUtils";
import { generatePDFReport } from "./utils/pdfGeneratorUtils";

/**
 * Hook for handling report export functionality
 * Extracts all export logic from ReportExporter component
 */
export const useReportExporter = () => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportOptions, setExportOptions] = useState<{
    includeSummary: boolean;
    includeCharts: boolean;
    includeTransactions: boolean;
    includeEnvelopes: boolean;
    includeSavings: boolean;
    includeInsights: boolean;
    customDateRange: null | { start: string; end: string };
  }>({
    includeSummary: true,
    includeCharts: true,
    includeTransactions: false,
    includeEnvelopes: true,
    includeSavings: true,
    includeInsights: true,
    customDateRange: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToPDF = useCallback(
    async (analyticsData: unknown, balanceData: unknown, timeFilter: unknown) => {
      await generatePDFReport(
        analyticsData,
        balanceData,
        timeFilter,
        exportOptions,
        setExportProgress
      );
    },
    [exportOptions]
  );

  const exportToCSV = useCallback(async (analyticsData: unknown) => {
    setExportProgress(10);
    const csvContent = convertToCSV(analyticsData);
    setExportProgress(80);

    const fileName = `VioletVault-Data-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, fileName);
    setExportProgress(100);
  }, []);

  const exportChartImages = useCallback(async () => {
    setExportProgress(10);

    const chartElements = getChartElements();

    for (let i = 0; i < chartElements.length; i++) {
      const element = chartElements[i];
      const chartName = element.getAttribute("data-chart-name") || `chart-${i + 1}`;

      setExportProgress(20 + (i * 60) / chartElements.length);

      // Dynamic import to avoid adding html2canvas to main bundle
      const html2canvas = (await import("html2canvas")).default;
      await exportChartAsImage(
        element,
        chartName,
        html2canvas as (element: Element, options: Record<string, unknown>) => Promise<HTMLCanvasElement>
      );

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setExportProgress(100);
  }, []);

  const handleExport = useCallback(
    async (
      analyticsData: unknown,
      balanceData: unknown,
      timeFilter: unknown,
      onExport: () => void,
      onClose: () => void
    ) => {
      setIsExporting(true);
      setExportProgress(0);

      try {
        logger.info("Starting export", { format: exportFormat, options: exportOptions });

        await executeExport(
          exportFormat,
          { exportToPDF, exportToCSV, exportChartImages },
          { analyticsData, balanceData, timeFilter }
        );

        handleExportComplete(exportFormat, exportOptions, onExport, onClose);
      } catch (error) {
        handleExportError(error);
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    [exportFormat, exportOptions, exportToPDF, exportToCSV, exportChartImages]
  );

  const applyTemplate = useCallback((template: string) => {
    const templateOptions = getTemplateOptions(template);
    if (templateOptions) {
      setExportOptions((prev) => ({ ...prev, ...templateOptions }));
    }
  }, []);

  return {
    // State
    exportFormat,
    exportOptions,
    isExporting,
    exportProgress,

    // Actions
    setExportFormat,
    setExportOptions,
    handleExport,
    applyTemplate,
  };
};
