import { useCallback } from "react";
import { encryptionUtils } from "../utils/encryption";
import { useAuth } from "../stores/authStore.jsx";
import { useToastHelpers } from "../utils/toastHelpers";
import logger from "../utils/logger";

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = () => {
  const { encryptionKey, currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();

  const exportData = useCallback(async () => {
    try {
      logger.info("Starting export process");

      // Try different localStorage keys (new Zustand format first, then old formats)
      let rawData = null;
      let dataSource = null;

      // Try new violet-vault-store (develop branch)
      const newData = localStorage.getItem("violet-vault-store");
      if (newData) {
        rawData = JSON.parse(newData);
        dataSource = "violet-vault-store";
        logger.debug("Found data in violet-vault-store");
      }

      // Try old budget-store (main branch)
      if (!rawData) {
        const oldData = localStorage.getItem("budget-store");
        if (oldData) {
          rawData = JSON.parse(oldData);
          dataSource = "budget-store";
          logger.debug("Found data in budget-store");
        }
      }

      // Try legacy envelopeBudgetData (very old format)
      if (!rawData) {
        const legacyData = localStorage.getItem("envelopeBudgetData");
        if (legacyData) {
          const { encryptedData, iv } = JSON.parse(legacyData);
          rawData = {
            state: await encryptionUtils.decrypt(encryptedData, encryptionKey, iv),
          };
          dataSource = "envelopeBudgetData";
          logger.debug("Found encrypted data in envelopeBudgetData");
        }
      }

      if (!rawData) {
        showWarningToast("No data found to export", "Export Error");
        return;
      }

      // Extract data from different store formats
      let decryptedData;
      if (dataSource === "violet-vault-store") {
        // New Zustand format - data is directly in state
        decryptedData = rawData.state || rawData;
      } else if (dataSource === "budget-store") {
        // Old Zustand format - data is in state property
        decryptedData = rawData.state || rawData;
      } else {
        // Legacy encrypted format - already decrypted above
        decryptedData = rawData.state;
      }

      logger.debug("Data extracted from source", {
        source: dataSource,
        keys: Object.keys(decryptedData),
      });

      // Log what old data we're filtering out
      const deprecatedFields = Object.keys(decryptedData).filter((key) =>
        ["updatedEnvelopes", "oldTransactions", "oldBills", "oldSavingsGoals"].includes(key)
      );

      if (deprecatedFields.length > 0) {
        logger.debug("Filtering out deprecated fields", {
          fields: deprecatedFields,
        });
      }

      // Check for nested deprecated data in envelopes
      const envelopesWithOldData = (decryptedData.envelopes || []).filter(
        (env) => env.transactions || env.paidTransactions || env.upcomingBills || env.overdueBills
      );

      if (envelopesWithOldData.length > 0) {
        logger.debug("Cleaning nested transaction arrays from envelopes", {
          count: envelopesWithOldData.length,
        });
      }

      // Normalize transactions for unified structure
      const allTransactions = Array.isArray(decryptedData.allTransactions)
        ? decryptedData.allTransactions
        : [...(decryptedData.transactions || []), ...(decryptedData.bills || [])];
      const transactions = allTransactions.filter((t) => !t.type || t.type === "transaction");

      // Clean up envelopes - remove old nested transaction arrays
      const cleanEnvelopes = (decryptedData.envelopes || []).map((envelope) => ({
        id: envelope.id,
        name: envelope.name,
        currentBalance: envelope.currentBalance || 0,
        targetAmount: envelope.targetAmount,
        monthlyAmount: envelope.monthlyAmount,
        biweeklyAllocation: envelope.biweeklyAllocation,
        color: envelope.color || "#a855f7",
        category: envelope.category || "Other",
        description: envelope.description || "",
        frequency: envelope.frequency || "monthly",
        priority: envelope.priority || "medium",
        autoAllocate: envelope.autoAllocate !== false,
        envelopeType: envelope.envelopeType || "variable",
        monthlyBudget: envelope.monthlyBudget,
        lastUpdated: envelope.lastUpdated,
        // Exclude all old nested arrays: transactions, paidTransactions, upcomingBills, etc.
      }));

      // Clean up bills - keep only essential fields
      const cleanBills = (decryptedData.bills || []).map((bill) => ({
        id: bill.id,
        name: bill.name || bill.provider,
        provider: bill.provider,
        amount: bill.amount || 0,
        dueDate: bill.dueDate,
        frequency: bill.frequency || "monthly",
        category: bill.category,
        envelopeId: bill.envelopeId,
        isPaid: bill.isPaid || false,
        paidDate: bill.paidDate,
        description: bill.description,
        notes: bill.notes,
        accountNumber: bill.accountNumber,
        lastUpdated: bill.lastUpdated,
        type: bill.type || "bill",
      }));

      // Prepare clean export data - only include current, relevant fields
      const exportData = {
        // Core data arrays (cleaned)
        envelopes: cleanEnvelopes,
        bills: cleanBills,
        transactions,
        allTransactions,

        // Other current data
        savingsGoals: decryptedData.savingsGoals || [],
        supplementalAccounts: decryptedData.supplementalAccounts || [],
        debts: decryptedData.debts || [],
        paycheckHistory: decryptedData.paycheckHistory || [],

        // Financial state
        unassignedCash: decryptedData.unassignedCash || 0,
        biweeklyAllocation: decryptedData.biweeklyAllocation || 0,
        actualBalance: decryptedData.actualBalance || 0,
        isActualBalanceManual: decryptedData.isActualBalanceManual || false,

        // Exclude deprecated fields like: updatedEnvelopes, oldTransactions, etc.

        // Metadata
        exportMetadata: {
          exportedBy: currentUser?.userName || "Unknown User",
          exportDate: new Date().toISOString(),
          appVersion: "1.8.0",
          dataVersion: "2.0",
          dataSource: dataSource,
          exportedFrom: "develop-branch",
        },
        // Data structure explanation for users
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

      // Create and download the file
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
        envelopes: cleanEnvelopes.length,
        bills: cleanBills.length,
        transactions: transactions.length,
        allTransactions: allTransactions.length,
        savingsGoals: exportData.savingsGoals.length,
        deprecatedFields: deprecatedFields.join(", ") || "none found",
        fileSizeKB: Math.round(dataStr.length / 1024),
      });

      showSuccessToast(
        `Clean export created with ${cleanEnvelopes.length} envelopes, ${cleanBills.length} bills, and ${transactions.length} transactions (${Math.round(dataStr.length / 1024)}KB)`,
        "Export Completed"
      );
    } catch (error) {
      logger.error("Export failed", error);
      showErrorToast(`Export failed: ${error.message}`, "Export Failed");
    }
  }, [encryptionKey, currentUser, showErrorToast, showSuccessToast, showWarningToast]);

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
          // Backup from the correct localStorage key
          const currentVioletData = localStorage.getItem("violet-vault-store");
          const currentBudgetData = localStorage.getItem("budget-store");
          const currentLegacyData = localStorage.getItem("envelopeBudgetData");

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

          if (currentVioletData) {
            localStorage.setItem(`violet-vault-store_backup_${timestamp}`, currentVioletData);
            logger.debug("Current violet-vault-store data backed up");
          }
          if (currentBudgetData) {
            localStorage.setItem(`budget-store_backup_${timestamp}`, currentBudgetData);
            logger.debug("Current budget-store data backed up");
          }
          if (currentLegacyData) {
            localStorage.setItem(`envelopeBudgetData_backup_${timestamp}`, currentLegacyData);
            logger.debug("Current legacy data backed up");
          }
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
