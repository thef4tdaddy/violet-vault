import { useCallback } from "react";
import { useAuth } from "../stores/authStore.jsx";
import { useToastHelpers } from "../utils/toastHelpers";
import logger from "../utils/logger";
import { budgetDb, getBudgetMetadata } from "../db/budgetDb.js";

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = () => {
  const { currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();

  const exportData = useCallback(async () => {
    try {
      logger.info("Starting export process");

      const [envelopes, bills, transactions, savingsGoals, debts, paycheckHistory, metadata] =
        await Promise.all([
          budgetDb.envelopes.toArray(),
          budgetDb.bills.toArray(),
          budgetDb.transactions.toArray(),
          budgetDb.savingsGoals.toArray(),
          budgetDb.debts.toArray(),
          budgetDb.paycheckHistory.toArray(),
          getBudgetMetadata(),
        ]);

      const hasData =
        envelopes.length ||
        bills.length ||
        transactions.length ||
        savingsGoals.length ||
        debts.length ||
        paycheckHistory.length;

      if (!hasData) {
        showWarningToast("No data found to export", "Export Error");
        return;
      }

      const pureTransactions = transactions.filter((t) => !t.type || t.type === "transaction");

      const exportData = {
        envelopes,
        bills,
        transactions: pureTransactions,
        allTransactions: transactions,
        savingsGoals,
        supplementalAccounts: metadata?.supplementalAccounts || [],
        debts,
        paycheckHistory,
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
        },
        _dataGuide: {
          note: "For mass updates, use these primary arrays:",
          primaryArrays: {
            envelopes: "Main envelope data - edit currentBalance, name, category, etc.",
            bills: "Bill payment data - edit amount, dueDate, provider, etc.",
            transactions: "Pure transactions only (filtered from allTransactions)",
            allTransactions:
              "All transactions + bills combined (auto-generated, don't edit directly)",
          },
          deprecatedArrays: {
            note: "These may exist from old exports but are not actively used in v1.8+",
            examples: ["updatedEnvelopes", "oldTransactions"],
          },
          importInstructions:
            "Edit 'envelopes', 'bills', or 'transactions' arrays, then re-import. The app will rebuild 'allTransactions' automatically.",
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
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
        fileSizeKB: Math.round(dataStr.length / 1024),
      });

      showSuccessToast(
        `Export created with ${envelopes.length} envelopes, ${bills.length} bills, and ${pureTransactions.length} transactions (${Math.round(
          dataStr.length / 1024
        )}KB)`,
        "Export Completed"
      );
    } catch (error) {
      logger.error("Export failed", error);
      showErrorToast(`Export failed: ${error.message}`, "Export Failed");
    }
  }, [currentUser, showErrorToast, showSuccessToast, showWarningToast]);

  const importData = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        logger.info("Starting import process");

        // Read the file
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        // Parse JSON
        const importedData = JSON.parse(fileContent);
        logger.info("File parsed successfully", {
          envelopes: importedData.envelopes?.length || 0,
          bills: importedData.bills?.length || 0,
          savingsGoals: importedData.savingsGoals?.length || 0,
          allTransactions: importedData.allTransactions?.length || 0,
        });

        // Build unified transaction list if missing
        const unifiedAllTransactions = Array.isArray(importedData.allTransactions)
          ? importedData.allTransactions
          : [...(importedData.transactions || []), ...(importedData.bills || [])];
        const unifiedTransactions = unifiedAllTransactions.filter(
          (t) => !t.type || t.type === "transaction"
        );

        // Validate the data structure
        if (!importedData.envelopes || !Array.isArray(importedData.envelopes)) {
          throw new Error("Invalid backup file: missing or invalid envelopes data");
        }

        // Confirm import with user
        const confirmed = confirm(
          `Import ${importedData.envelopes?.length || 0} envelopes, ${importedData.bills?.length || 0} bills, and ${importedData.allTransactions?.length || 0} transactions?\n\nThis will replace your current data.`
        );

        if (!confirmed) {
          logger.info("Import cancelled by user");
          return;
        }

        // Create backup of current data before import
        try {
          const [envelopes, bills, transactions, savingsGoals, debts, paycheckHistory, metadata] =
            await Promise.all([
              budgetDb.envelopes.toArray(),
              budgetDb.bills.toArray(),
              budgetDb.transactions.toArray(),
              budgetDb.savingsGoals.toArray(),
              budgetDb.debts.toArray(),
              budgetDb.paycheckHistory.toArray(),
              getBudgetMetadata(),
            ]);

          const currentData = {
            envelopes,
            bills,
            transactions,
            savingsGoals,
            debts,
            paycheckHistory,
            unassignedCash: metadata?.unassignedCash || 0,
            biweeklyAllocation: metadata?.biweeklyAllocation || 0,
            actualBalance: metadata?.actualBalance || 0,
            isActualBalanceManual: metadata?.isActualBalanceManual || false,
          };

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          localStorage.setItem(`dexie_backup_${timestamp}`, JSON.stringify(currentData));
          logger.debug("Current Dexie data backed up");
        } catch (backupError) {
          logger.warn("Failed to create backup", backupError);
        }

        // Prepare the data for loading - ensure user information is preserved
        const processedData = {
          ...importedData,
          transactions: unifiedTransactions,
          allTransactions: unifiedAllTransactions,
          // Preserve current user info
          currentUser: currentUser,
        };

        logger.info("Import completed successfully");
        showSuccessToast("Data imported successfully!", "Import Completed");

        return processedData;
      } catch (error) {
        logger.error("Import failed", error);
        showErrorToast(`Import failed: ${error.message}`, "Import Failed");
        throw error;
      }
    },
    [currentUser, showErrorToast, showSuccessToast]
  );

  const resetEncryptionAndStartFresh = useCallback(() => {
    logger.info("Resetting encryption and starting fresh");

    // Clear all stored data
    const keysToRemove = ["envelopeBudgetData", "userProfile", "passwordLastChanged"];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear any backup data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("envelopeBudgetData_backup_")) {
        localStorage.removeItem(key);
      }
    });

    logger.info("All data cleared, ready for fresh start");

    // Force page reload to reset application state
    window.location.reload();
  }, []);

  return {
    exportData,
    importData,
    resetEncryptionAndStartFresh,
  };
};

export default useDataManagement;
