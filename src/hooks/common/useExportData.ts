import { useCallback } from "react";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";
import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import { constructExportObject } from "./useExportDataHelpers";

const gatherDataForExport = async () => {
  logger.info("Gathering data for export");
  return Promise.all([
    budgetDb.envelopes.toArray(),
    budgetDb.bills.toArray(),
    budgetDb.transactions.toArray(),
    budgetDb.savingsGoals.toArray(),
    budgetDb.debts.toArray(),
    budgetDb.paycheckHistory.toArray(),
    budgetDb.auditLog.toArray(),
    getBudgetMetadata(),
  ]);
};

const triggerDownload = (exportableData) => {
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

const logExportSuccess = (data, pureTransactions, fileSize) => {
  const [envelopes, bills, , , debts, , ,] = data;

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

const buildExportSummary = (counts) => {
  return [
    `${counts.envelopes} envelopes`,
    `${counts.bills} bills`,
    `${counts.debts} debts`,
    `${counts.transactions} transactions`,
  ].join(", ");
};

export const useExportData = () => {
  const { user: currentUser } = useAuthManager();
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

      const exportableData = constructExportObject(data, currentUser);
      const fileSize = triggerDownload(exportableData);
      const pureTransactions = exportableData.transactions;

      const counts = logExportSuccess(data, pureTransactions, fileSize);
      const exportSummary = buildExportSummary(counts);

      showSuccessToast(
        `Export created with ${exportSummary} (${counts.fileSizeKB}KB)`,
        "Export Completed"
      );
    } catch (error) {
      logger.error("Export failed", error);
      showErrorToast(`Export failed: ${error.message}`, "Export Failed");
    }
  }, [currentUser, showErrorToast, showSuccessToast, showWarningToast]);

  return { exportData };
};
