import { useCallback } from "react";
import { useAuthManager } from "../auth/useAuthManager";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";
import { budgetDb, getBudgetMetadata } from "../../db/budgetDb.ts";

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

const constructExportObject = (data, currentUser) => {
  const [envelopes, bills, transactions, savingsGoals, debts, paycheckHistory, auditLog, metadata] =
    data;

  const pureTransactions = transactions.filter((t) => !t.type || t.type === "transaction");

  return {
    envelopes,
    bills,
    transactions: pureTransactions,
    allTransactions: transactions,
    savingsGoals,
    supplementalAccounts: metadata?.supplementalAccounts || [],
    debts,
    paycheckHistory,
    auditLog,
    unassignedCash: metadata?.unassignedCash || 0,
    biweeklyAllocation: metadata?.biweeklyAllocation || 0,
    actualBalance: metadata?.actualBalance || 0,
    isActualBalanceManual: metadata?.isActualBalanceManual || false,
    exportMetadata: {
      exportedBy: currentUser?.userName || "Unknown User",
      exportDate: new Date().toISOString(),
      appVersion: "1.8.0",
      dataVersion: "2.0",
      dataSource: "dexie",
      exportedFrom: "develop-branch",
      budgetId: currentUser?.budgetId,
      userColor: currentUser?.userColor,
      syncContext: {
        note: "This data was encrypted with a specific budgetId. Import will create new encryption context.",
        originalBudgetId: currentUser?.budgetId,
        exportTimestamp: Date.now(),
      },
    },
    _dataGuide: {
      note: "For mass updates, use these primary arrays:",
      primaryArrays: {
        envelopes: "Main envelope data - edit currentBalance, name, category, etc.",
        bills: "Bill payment data - edit amount, dueDate, provider, etc.",
        debts: "Debt tracking data - edit currentBalance, minimumPayment, etc.",
        savingsGoals: "Savings goal data - edit targetAmount, currentAmount, etc.",
        paycheckHistory: "Paycheck history for trend analysis",
        transactions: "Pure transactions only (filtered from allTransactions)",
        allTransactions: "All transactions + bills combined (auto-generated, don't edit directly)",
        auditLog: "Change history and audit trail (generally shouldn't be edited)",
      },
      deprecatedArrays: {
        note: "These may exist from old exports but are not actively used in v1.8+",
        examples: ["updatedEnvelopes", "oldTransactions"],
      },
      importInstructions:
        "Edit 'envelopes', 'bills', or 'transactions' arrays, then re-import. The app will rebuild 'allTransactions' automatically.",
    },
  };
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
