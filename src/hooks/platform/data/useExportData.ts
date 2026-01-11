import { useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";
import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import { constructExportObject, triggerDownload } from "./useExportDataHelpers";
import { trackExport } from "@/utils/monitoring/performanceMonitor";
import type { Envelope, Transaction } from "@/db/types";

const gatherDataForExport = async (): Promise<[Envelope[], Transaction[], unknown[], unknown]> => {
  logger.info("Gathering data for export");
  return Promise.all([
    budgetDb.envelopes.toArray(),
    budgetDb.transactions.toArray(),
    budgetDb.auditLog.toArray(),
    getBudgetMetadata(),
  ]);
};

const logExportSuccess = (
  counts: { envelopes: number; transactions: number },
  fileSize: number
) => {
  logger.info("Export completed successfully", {
    envelopes: counts.envelopes,
    transactions: counts.transactions,
    fileSizeKB: Math.round(fileSize / 1024),
  });
};

const buildExportSummary = (counts: { envelopes: number; transactions: number }): string => {
  return [`${counts.envelopes} envelopes`, `${counts.transactions} transactions`].join(", ");
};

export const useExportData = () => {
  const { user: currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();

  const exportData = useCallback(async () => {
    try {
      logger.info("Starting export process");
      const data = await gatherDataForExport();
      const [envelopes, transactions, auditLog, metadata] = data;

      if (envelopes.length === 0 && transactions.length === 0) {
        showWarningToast("No data found to export", "Export Error");
        return;
      }

      // Track export performance
      const exportFn = async () => {
        const safeMetadata = (metadata || {}) as Record<string, unknown>;
        const exportableData = constructExportObject(
          [envelopes, transactions, auditLog, safeMetadata],
          currentUser
        );
        const fileSize = triggerDownload(exportableData);
        return { fileSize };
      };

      const exportMetadata = {
        envelopes: envelopes.length,
        transactions: transactions.length,
      };

      const { fileSize } = await trackExport(exportFn, exportMetadata);

      const counts = { envelopes: envelopes.length, transactions: transactions.length };
      logExportSuccess(counts, fileSize);
      const exportSummary = buildExportSummary(counts);
      const fileSizeKB = Math.round(fileSize / 1024);

      showSuccessToast(
        `Export created with ${exportSummary} (${fileSizeKB}KB)`,
        "Export Completed"
      );
    } catch (error) {
      logger.error("Export failed", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showErrorToast(`Export failed: ${errorMessage}`, "Export Failed");
    }
  }, [currentUser, showErrorToast, showSuccessToast, showWarningToast]);

  return { exportData };
};
