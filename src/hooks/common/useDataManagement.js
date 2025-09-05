/* eslint-disable max-lines */
import { useCallback } from "react";
import { useAuth } from "../../stores/auth/authStore.jsx";
import { useConfirm } from "./useConfirm";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";
import { budgetDb, getBudgetMetadata } from "../../db/budgetDb.js";
import { cloudSyncService } from "../../services/cloudSyncService.js";

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = () => {
  const { currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } =
    useToastHelpers();
  const confirm = useConfirm();

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
        (t) => !t.type || t.type === "transaction",
      );

      const exportData = {
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
          // CRITICAL: Include sync context to prevent corruption on import
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
            envelopes:
              "Main envelope data - edit currentBalance, name, category, etc.",
            bills: "Bill payment data - edit amount, dueDate, provider, etc.",
            debts:
              "Debt tracking data - edit currentBalance, minimumPayment, etc.",
            savingsGoals:
              "Savings goal data - edit targetAmount, currentAmount, etc.",
            paycheckHistory: "Paycheck history for trend analysis",
            transactions:
              "Pure transactions only (filtered from allTransactions)",
            allTransactions:
              "All transactions + bills combined (auto-generated, don't edit directly)",
            auditLog:
              "Change history and audit trail (generally shouldn't be edited)",
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

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
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
        "Export Completed",
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
          debts: importedData.debts?.length || 0,
          auditLog: importedData.auditLog?.length || 0,
          allTransactions: importedData.allTransactions?.length || 0,
        });

        // Build unified transaction list if missing
        const unifiedAllTransactions = Array.isArray(
          importedData.allTransactions,
        )
          ? importedData.allTransactions
          : [
              ...(importedData.transactions || []),
              ...(importedData.bills || []),
            ];
        // Filter transactions (variable used later in validation)
        // const unifiedTransactions = unifiedAllTransactions.filter(
        //   (t) => !t.type || t.type === "transaction",
        // );

        // Validate the data structure
        if (!importedData.envelopes || !Array.isArray(importedData.envelopes)) {
          throw new Error(
            "Invalid backup file: missing or invalid envelopes data",
          );
        }

        // Check for budgetId mismatch and warn user
        const importBudgetId = importedData.exportMetadata?.budgetId;
        const currentBudgetId = currentUser?.budgetId;
        const hasBudgetIdMismatch =
          importBudgetId &&
          currentBudgetId &&
          importBudgetId !== currentBudgetId;

        let confirmMessage = `Import ${importedData.envelopes?.length || 0} envelopes, ${importedData.bills?.length || 0} bills, ${importedData.debts?.length || 0} debts, ${importedData.auditLog?.length || 0} audit entries, and ${importedData.allTransactions?.length || 0} transactions?\n\nThis will replace your current data.`;

        if (hasBudgetIdMismatch) {
          confirmMessage += `\n\n⚠️ ENCRYPTION CONTEXT CHANGE DETECTED:\nBackup budgetId: ${importBudgetId?.substring(0, 12)}...\nCurrent budgetId: ${currentBudgetId?.substring(0, 12)}...\n\nImport will re-encrypt data with your current session context.`;
        }

        // Confirm import with user
        const confirmed = await confirm({
          title: hasBudgetIdMismatch
            ? "Import Data (Encryption Context Change)"
            : "Import Data",
          message: confirmMessage,
          confirmLabel: "Import Data",
          cancelLabel: "Cancel",
          destructive: true,
        });

        if (!confirmed) {
          logger.info("Import cancelled by user");
          return;
        }

        // Create backup of current data before import
        try {
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

          const currentData = {
            envelopes,
            bills,
            transactions,
            savingsGoals,
            debts,
            paycheckHistory,
            auditLog,
            unassignedCash: metadata?.unassignedCash || 0,
            biweeklyAllocation: metadata?.biweeklyAllocation || 0,
            actualBalance: metadata?.actualBalance || 0,
            isActualBalanceManual: metadata?.isActualBalanceManual || false,
          };

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          localStorage.setItem(
            `dexie_backup_${timestamp}`,
            JSON.stringify(currentData),
          );
          logger.debug("Current Dexie data backed up");
        } catch (backupError) {
          logger.warn("Failed to create backup", backupError);
        }

        // Clear existing data from Firebase first to prevent sync conflicts
        try {
          logger.info("Clearing Firebase data before import...");
          await cloudSyncService.clearAllData();
          logger.info("Firebase data cleared successfully");

          // CRITICAL: Also clear any sync metadata that might point to corrupted cloud data
          logger.info(
            "Clearing sync metadata to prevent corruption detection...",
          );
          const { budgetDb } = await import("../../db/budgetDb");
          try {
            if (budgetDb.syncMetadata) {
              await budgetDb.syncMetadata.clear();
              logger.info("Sync metadata cleared");
            } else {
              logger.info("No sync metadata table found, skipping clear");
            }
          } catch (syncMetadataError) {
            logger.warn(
              "Failed to clear sync metadata, continuing import",
              syncMetadataError,
            );
          }
        } catch (firebaseError) {
          logger.warn(
            "Failed to clear Firebase data, proceeding with import",
            firebaseError,
          );
          // Continue with import even if Firebase clear fails
        }

        // Clear existing data from Dexie
        await budgetDb.transaction(
          "rw",
          [
            budgetDb.envelopes,
            budgetDb.bills,
            budgetDb.transactions,
            budgetDb.savingsGoals,
            budgetDb.debts,
            budgetDb.paycheckHistory,
            budgetDb.auditLog,
            budgetDb.budget,
          ],
          async () => {
            // Clear all existing data with robust error handling
            try {
              await budgetDb.envelopes.clear();
            } catch (error) {
              logger.warn(
                "Standard envelope clear failed, using individual deletion",
                error,
              );
              await budgetDb.envelopes.toCollection().delete();
            }

            try {
              await budgetDb.bills.clear();
            } catch (error) {
              logger.warn(
                "Standard bill clear failed, using individual deletion",
                error,
              );
              await budgetDb.bills.toCollection().delete();
            }

            try {
              await budgetDb.transactions.clear();
            } catch (error) {
              logger.warn(
                "Standard transaction clear failed, using individual deletion",
                error,
              );
              await budgetDb.transactions.toCollection().delete();
            }

            try {
              await budgetDb.savingsGoals.clear();
            } catch (error) {
              logger.warn(
                "Standard savings goals clear failed, using individual deletion",
                error,
              );
              await budgetDb.savingsGoals.toCollection().delete();
            }

            try {
              await budgetDb.debts.clear();
            } catch (error) {
              logger.warn(
                "Standard debt clear failed, using individual deletion",
                error,
              );
              await budgetDb.debts.toCollection().delete();
            }

            try {
              await budgetDb.paycheckHistory.clear();
            } catch (error) {
              logger.warn(
                "Standard paycheck clear failed, using individual deletion",
                error,
              );
              // For paycheckHistory, we need to be extra aggressive due to corrupted records
              try {
                await budgetDb.paycheckHistory.toCollection().delete();
              } catch (individualError) {
                logger.warn(
                  "Individual paycheck deletion failed, using manual cleanup",
                  individualError,
                );
                // Manual cleanup for corrupted records
                const allPaychecks = await budgetDb.paycheckHistory.toArray();
                for (const paycheck of allPaychecks) {
                  try {
                    if (paycheck.id) {
                      await budgetDb.paycheckHistory.delete(paycheck.id);
                    } else {
                      // Delete by composite key for records without ID
                      await budgetDb.paycheckHistory
                        .where("[date+amount]")
                        .equals([paycheck.date, paycheck.amount])
                        .delete();
                    }
                  } catch (deleteError) {
                    logger.error(
                      "Failed to delete individual paycheck record",
                      {
                        paycheck,
                        error: deleteError.message,
                      },
                    );
                  }
                }
              }
            }

            try {
              await budgetDb.auditLog.clear();
            } catch (error) {
              logger.warn(
                "Standard audit log clear failed, using individual deletion",
                error,
              );
              await budgetDb.auditLog.toCollection().delete();
            }

            // Import new data
            if (importedData.envelopes?.length) {
              await budgetDb.envelopes.bulkAdd(importedData.envelopes);
            }

            if (importedData.bills?.length) {
              await budgetDb.bills.bulkAdd(importedData.bills);
            }

            if (unifiedAllTransactions?.length) {
              await budgetDb.transactions.bulkAdd(unifiedAllTransactions);
            }

            if (importedData.savingsGoals?.length) {
              await budgetDb.savingsGoals.bulkAdd(importedData.savingsGoals);
            }

            if (importedData.debts?.length) {
              await budgetDb.debts.bulkAdd(importedData.debts);
            }

            if (importedData.paycheckHistory?.length) {
              await budgetDb.paycheckHistory.bulkAdd(
                importedData.paycheckHistory,
              );
            }

            if (importedData.auditLog?.length) {
              await budgetDb.auditLog.bulkAdd(importedData.auditLog);
            }

            // Import metadata (budget settings)
            await budgetDb.budget.put({
              id: "metadata",
              unassignedCash: importedData.unassignedCash || 0,
              biweeklyAllocation: importedData.biweeklyAllocation || 0,
              actualBalance: importedData.actualBalance || 0,
              isActualBalanceManual:
                importedData.isActualBalanceManual || false,
              supplementalAccounts: importedData.supplementalAccounts || [],
              lastUpdated: new Date().toISOString(),
            });
          },
        );

        logger.info("Import completed successfully", {
          imported: {
            envelopes: importedData.envelopes?.length || 0,
            bills: importedData.bills?.length || 0,
            transactions: unifiedAllTransactions?.length || 0,
            savingsGoals: importedData.savingsGoals?.length || 0,
            debts: importedData.debts?.length || 0,
            paycheckHistory: importedData.paycheckHistory?.length || 0,
            auditLog: importedData.auditLog?.length || 0,
          },
        });

        showSuccessToast(
          `Local data imported! Now syncing to cloud...`,
          "Import Complete",
        );

        // CRITICAL: Stop sync service and clear all corruption tracking before restart
        try {
          logger.info("🛑 Stopping sync service before clean restart...");
          cloudSyncService.stop();

          // Wait for sync to fully stop
          await new Promise((resolve) => setTimeout(resolve, 2000));

          logger.info(
            "🧹 Clearing any corruption detection state to prevent false positives...",
          );
          // Clear any cached corruption/failure state that might interfere
          const { chunkedSyncService } = await import(
            "../../services/chunkedSyncService"
          );
          if (chunkedSyncService && chunkedSyncService.decryptionFailures) {
            chunkedSyncService.decryptionFailures.clear();
            logger.info("✅ Cleared decryption failure tracking");
          }

          logger.info(
            "🚀 Force pushing imported data to Firebase with clean slate...",
          );
          const result = await cloudSyncService.forcePushToCloud();

          if (result.success) {
            logger.info("✅ Imported data successfully pushed to Firebase.");
            showSuccessToast(
              "Import complete! Data synced to cloud successfully.",
            );
          } else {
            throw new Error(result.error || "Failed to push to cloud");
          }
        } catch (syncError) {
          logger.error("Failed to push imported data to Firebase", syncError);
          showErrorToast(
            `Cloud sync failed: ${syncError.message}. Data imported locally but may need manual cloud sync.`,
          );
        }

        // Invalidate TanStack Query cache to refresh UI with new data instead of page reload
        try {
          // Wait a bit more to ensure sync is complete
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { queryClient } = await import(
            "../../utils/common/queryClient"
          );
          await queryClient.invalidateQueries();
          logger.info("TanStack Query cache invalidated after data import");
        } catch (error) {
          logger.warn(
            "Failed to invalidate query cache, falling back to page reload",
            error,
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }

        return {
          success: true,
          imported: {
            envelopes: importedData.envelopes?.length || 0,
            bills: importedData.bills?.length || 0,
            transactions: unifiedAllTransactions?.length || 0,
            savingsGoals: importedData.savingsGoals?.length || 0,
            debts: importedData.debts?.length || 0,
            paycheckHistory: importedData.paycheckHistory?.length || 0,
            auditLog: importedData.auditLog?.length || 0,
          },
        };
      } catch (error) {
        logger.error("Import failed", error);
        showErrorToast(`Import failed: ${error.message}`, "Import Failed");
        throw error;
      }
    },
    [showErrorToast, showSuccessToast],
  );

  const resetEncryptionAndStartFresh = useCallback(() => {
    logger.info("Resetting encryption and starting fresh");

    // Clear all stored data
    const keysToRemove = [
      "envelopeBudgetData",
      "userProfile",
      "passwordLastChanged",
    ];

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
