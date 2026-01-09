import { useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";
import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import { constructExportObject } from "./useExportDataHelpers";
import { trackExport } from "@/utils/monitoring/performanceMonitor";

const gatherDataForExport = async (): Promise<
  [unknown[], unknown[], unknown[], unknown[], unknown[], unknown[], unknown]
> => {
  logger.info("Gathering data for export");
  // v2.0: Savings goals are now stored as envelopes with envelopeType: "savings"
  // No need to fetch from separate savingsGoals table
  return Promise.all([
    budgetDb.envelopes.toArray(),
    budgetDb.bills.toArray(),
    budgetDb.transactions.toArray(),
    budgetDb.debts.toArray(),
    budgetDb.paycheckHistory.toArray(),
    budgetDb.auditLog.toArray(),
    getBudgetMetadata(),
  ]);
};

const triggerDownload = (exportableData: unknown): number => {
  const dataStr = JSON.stringify(exportableData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.download = `VioletVault Budget Backup ${timestamp}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return dataStr.length;
};

const logExportSuccess = (
  data: [unknown[], unknown[], unknown[], unknown[], unknown[], unknown[], unknown],
  pureTransactions: unknown[],
  fileSize: number
): {
  envelopes: number;
  bills: number;
  debts: number;
  transactions: number;
  fileSizeKB: number;
} => {
  const [envelopes, bills, , debts, , ,] = data;

  logger.info("Export completed successfully", {
    envelopes: envelopes.length,
    bills: bills.length,
    transactions: pureTransactions.length,
    fileSizeKB: Math.round(fileSize / 1024),
  });

  return {
    envelopes: envelopes.length,
    bills: bills.length,
    debts: debts.length,
    transactions: pureTransactions.length,
    fileSizeKB: Math.round(fileSize / 1024),
  };
};

const buildExportSummary = (counts: {
  envelopes: number;
  bills: number;
  debts: number;
  transactions: number;
}): string => {
  return [
    `${counts.envelopes} envelopes`,
    `${counts.bills} bills`,
    `${counts.debts} debts`,
    `${counts.transactions} transactions`,
  ].join(", ");
};

export const useExportData = () => {
  const { user: currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();

  const exportData = useCallback(async () => {
    try {
      logger.info("Starting export process");
      const data = await gatherDataForExport();
      const hasData = data.some((item) => (Array.isArray(item) ? item.length > 0 : item));

      if (!hasData) {
        showWarningToast("No data found to export", "Export Error");
        return;
      }

      // Track export performance with Sentry
      const exportFn = async () => {
        const exportableData = constructExportObject(data, currentUser);
        const fileSize = triggerDownload(exportableData);
        const pureTransactions = exportableData.transactions;
        return { exportableData, fileSize, pureTransactions };
      };

      const exportMetadata = {
        envelopes: (data[0] as unknown[]).length,
        transactions: (data[2] as unknown[]).length,
        bills: (data[1] as unknown[]).length,
        debts: (data[3] as unknown[]).length,
      };

      const exportResult = await trackExport(exportFn, exportMetadata);

      const counts = logExportSuccess(data, exportResult.pureTransactions, exportResult.fileSize);
      const exportSummary = buildExportSummary(counts);

      // Log successful data export
      logger.info("✅ Data exported", {
        envelopes: counts.envelopes,
        transactions: counts.transactions,
        bills: counts.bills,
        debts: counts.debts,
        fileSizeKB: counts.fileSizeKB,
      });

      showSuccessToast(
        `Export created with ${exportSummary} (${counts.fileSizeKB}KB)`,
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
