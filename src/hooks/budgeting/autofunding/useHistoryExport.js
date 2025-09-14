import { useCallback } from "react";
import logger from "../../../utils/common/logger";

/**
 * Hook for managing auto-funding history import/export
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useHistoryExport = () => {
  // Export history data
  const exportHistory = useCallback(
    (executionHistory, undoStack, options = {}) => {
      try {
        const { includeUndoStack = true, dateFrom, dateTo, format = "json" } = options;

        let historyToExport = [...executionHistory];

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          historyToExport = historyToExport.filter(
            (execution) => new Date(execution.executedAt) >= fromDate
          );
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          historyToExport = historyToExport.filter(
            (execution) => new Date(execution.executedAt) <= toDate
          );
        }

        const exportData = {
          executionHistory: historyToExport,
          undoStack: includeUndoStack ? undoStack : [],
          exportedAt: new Date().toISOString(),
          totalExecutions: historyToExport.length,
          dateRange: {
            from: dateFrom,
            to: dateTo,
          },
        };

        if (format === "csv") {
          return exportToCsv(historyToExport);
        }

        return {
          format: "json",
          content: JSON.stringify(exportData, null, 2),
          data: exportData,
          filename: generateFilename("json"),
        };
      } catch (error) {
        logger.error("Failed to export history", error);
        throw error;
      }
    },
    [exportToCsv, generateFilename]
  );

  const exportToCsv = useCallback(
    (historyToExport) => {
      const csvHeaders = [
        "Execution ID",
        "Trigger",
        "Executed At",
        "Rules Executed",
        "Total Funded",
        "Success",
      ].join(",");

      const csvRows = historyToExport.map((execution) =>
        [
          execution.id,
          execution.trigger,
          execution.executedAt,
          execution.rulesExecuted || 0,
          execution.totalFunded || 0,
          execution.success !== false ? "true" : "false",
        ].join(",")
      );

      return {
        format: "csv",
        content: [csvHeaders, ...csvRows].join("\n"),
        filename: generateFilename("csv"),
      };
    },
    [generateFilename]
  );

  const generateFilename = useCallback((format) => {
    const dateStr = new Date().toISOString().split("T")[0];
    return `auto-funding-history-${dateStr}.${format}`;
  }, []);

  return {
    exportHistory,
  };
};
