import { useCallback } from "react";
import { useAuth } from "../../stores/auth/authStore.jsx";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";
import { budgetDb, getBudgetMetadata } from "../../db/budgetDb.js";

export const useExportData = () => {
  const { currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();

  const exportData = useCallback(async () => {
    try {
      logger.info("Starting export process");

      const [
        envelopes,
        bills,
        transactions,
        savingsGoals,
        debts,
        paycheckHistory,
        auditLog,
        metadata,
      ] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.savingsGoals.toArray(),
        budgetDb.debts.toArray(),
        budgetDb.paycheckHistory.toArray(),
        budgetDb.auditLog.toArray(),
        getBudgetMetadata(),
      ]);

      const hasData =
        envelopes.length ||
        bills.length ||
        transactions.length ||
        savingsGoals.length ||
        debts.length ||
        paycheckHistory.length ||
        auditLog.length;

      if (!hasData) {
        showWarningToast("No data found to export", "Export Error");
        return;
      }

      const pureTransactions = transactions.filter(
        (t) => !t.type || t.type === "transaction"
      );

      const exportableData = {
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
          importInstructions: "Edit 'envelopes', 'bills', or 'transactions' arrays, then re-import. The app will rebuild 'allTransactions' automatically.",
        },
      };

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

      logger.info("Export completed successfully", {
        envelopes: envelopes.length,
        bills: bills.length,
        transactions: pureTransactions.length,
        allTransactions: transactions.length,
        savingsGoals: savingsGoals.length,
        debts: debts.length,
        paycheckHistory: paycheckHistory.length,
        auditLog: auditLog.length,
        fileSizeKB: Math.round(dataStr.length / 1024),
      });

      const exportSummary = [
        `${envelopes.length} envelopes`,
        `${bills.length} bills`,
        `${debts.length} debts`,
        `${pureTransactions.length} transactions`,
      ].join(", ");

      showSuccessToast(
        `Export created with ${exportSummary} (${Math.round(dataStr.length / 1024)}KB)`,
        "Export Completed"
      );
    } catch (error) {
      logger.error("Export failed", error);
      showErrorToast(`Export failed: ${error.message}`, "Export Failed");
    }
  }, [currentUser, showErrorToast, showSuccessToast, showWarningToast]);

  return { exportData };
};