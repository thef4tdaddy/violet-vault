import { create } from "zustand";
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * Local-Only Mode Store
 * Manages state for privacy-focused users who want to use VioletVault without cloud sync
 * or authentication requirements. All data is stored locally using Dexie IndexedDB.
 */
export const useLocalOnlyStore = create((set, get) => ({
  // Core state
  isLocalOnlyMode: false,
  localOnlyUser: null,
  isInitialized: false,

  // Initialize local-only mode
  initializeLocalOnlyMode: async (userData = null) => {
    try {
      logger.debug("Initializing local-only mode", { hasUserData: !!userData });

      // Create default user if none provided
      const defaultUser = {
        id: `local_user_${Date.now()}`,
        userName: "Local User",
        userColor: "#a855f7",
        budgetId: `local_budget_${Date.now()}`,
        mode: "local-only",
        createdAt: new Date().toISOString(),
        deviceFingerprint: navigator.userAgent
      };

      const localUser = userData || defaultUser;

      // Store user in Dexie with special local-only prefix
      await budgetDb.budget.put({
        id: "local_only_user",
        user: localUser,
        mode: "local-only",
        version: "1.0"
      });

      // Store mode flag in localStorage for quick startup check
      localStorage.setItem("localOnlyMode", "true");

      set({
        isLocalOnlyMode: true,
        localOnlyUser: localUser,
        isInitialized: true
      });

      logger.debug("Local-only mode initialized successfully", {
        userId: localUser.id,
        userName: localUser.userName
      });

      return { success: true, user: localUser };
    } catch (error) {
      logger.error("Failed to initialize local-only mode", error);
      return { success: false, error: error.message };
    }
  },

  // Exit local-only mode and clear data
  exitLocalOnlyMode: async (clearData = false) => {
    try {
      logger.debug("Exiting local-only mode", { clearData });

      if (clearData) {
        // Clear all local-only data from Dexie
        await budgetDb.transaction("rw", [budgetDb.budget, budgetDb.envelopes, budgetDb.transactions, budgetDb.bills, budgetDb.savingsGoals, budgetDb.paycheckHistory], async () => {
          // Only clear local-only mode data, not encrypted data
          await budgetDb.budget.where("id").equals("local_only_user").delete();
          // Clear local-only related data - in practice, local-only mode uses the same tables
          // but we'd want to clear all data when exiting
          await budgetDb.envelopes.clear();
          await budgetDb.transactions.clear(); 
          await budgetDb.bills.clear();
          await budgetDb.savingsGoals.clear();
          await budgetDb.paycheckHistory.clear();
        });
        logger.debug("Local-only data cleared from Dexie");
      }

      localStorage.removeItem("localOnlyMode");

      set({
        isLocalOnlyMode: false,
        localOnlyUser: null,
        isInitialized: false
      });

      logger.debug("Local-only mode exited successfully");
      return { success: true };
    } catch (error) {
      logger.error("Failed to exit local-only mode", error);
      return { success: false, error: error.message };
    }
  },

  // Update local user profile
  updateLocalUser: async (updates) => {
    try {
      const currentUser = get().localOnlyUser;
      if (!currentUser) {
        throw new Error("No local user found");
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
        lastModified: new Date().toISOString()
      };

      // Update in Dexie
      await budgetDb.budget.update("local_only_user", {
        user: updatedUser
      });

      set({
        localOnlyUser: updatedUser
      });

      logger.debug("Local user updated", { updates });
      return { success: true, user: updatedUser };
    } catch (error) {
      logger.error("Failed to update local user", error);
      return { success: false, error: error.message };
    }
  },

  // Check if already in local-only mode (for app startup)
  checkLocalOnlyMode: async () => {
    try {
      const isLocalMode = localStorage.getItem("localOnlyMode") === "true";

      if (isLocalMode) {
        // Try to load user from Dexie
        const userData = await budgetDb.budget.get("local_only_user");
        
        if (userData && userData.user) {
          const localUser = userData.user;
          
          set({
            isLocalOnlyMode: true,
            localOnlyUser: localUser,
            isInitialized: true
          });

          logger.debug("Restored local-only mode from Dexie", {
            userId: localUser.id,
            userName: localUser.userName
          });

          return { success: true, user: localUser };
        }
      }

      return { success: false, message: "No local-only mode found" };
    } catch (error) {
      logger.error("Failed to check local-only mode", error);
      return { success: false, error: error.message };
    }
  },

  // Export all local-only data
  exportLocalOnlyData: async () => {
    try {
      const localUser = get().localOnlyUser;
      if (!localUser) {
        throw new Error("No local user found");
      }

      // Collect all data from Dexie
      const [envelopes, transactions, bills, savingsGoals, paycheckHistory] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.savingsGoals.toArray(),
        budgetDb.paycheckHistory.toArray()
      ]);

      const exportData = {
        version: "1.0",
        type: "violet-vault-local-only-export",
        exportedAt: new Date().toISOString(),
        user: localUser,
        envelopes: envelopes,
        transactions: transactions,
        bills: bills,
        savingsGoals: savingsGoals,
        paycheckHistory: paycheckHistory,
        metadata: {
          totalEnvelopes: envelopes.length,
          totalTransactions: transactions.length,
          totalBills: bills.length,
          totalSavingsGoals: savingsGoals.length,
          totalPaycheckHistory: paycheckHistory.length,
          dataSize: new Blob([JSON.stringify({
            envelopes,
            transactions,
            bills,
            savingsGoals,
            paycheckHistory
          })]).size
        }
      };

      logger.debug("Local-only data exported from Dexie", {
        totalEnvelopes: exportData.metadata.totalEnvelopes,
        totalTransactions: exportData.metadata.totalTransactions,
        dataSize: exportData.metadata.dataSize
      });

      return { success: true, data: exportData };
    } catch (error) {
      logger.error("Failed to export local-only data", error);
      return { success: false, error: error.message };
    }
  },

  // Import local-only data
  importLocalOnlyData: async (importData) => {
    try {
      if (!importData || importData.type !== "violet-vault-local-only-export") {
        throw new Error("Invalid local-only export data");
      }

      if (importData.version !== "1.0") {
        throw new Error(`Unsupported export version: ${importData.version}`);
      }

      // Import all data using Dexie transaction
      await budgetDb.transaction("rw", [budgetDb.budget, budgetDb.envelopes, budgetDb.transactions, budgetDb.bills, budgetDb.savingsGoals, budgetDb.paycheckHistory], async () => {
        // Clear existing data first
        await budgetDb.envelopes.clear();
        await budgetDb.transactions.clear();
        await budgetDb.bills.clear();
        await budgetDb.savingsGoals.clear();
        await budgetDb.paycheckHistory.clear();

        // Import user
        if (importData.user) {
          await budgetDb.budget.put({
            id: "local_only_user",
            user: importData.user,
            mode: "local-only",
            version: "1.0"
          });
          set({ localOnlyUser: importData.user });
        }

        // Import data arrays
        if (importData.envelopes && importData.envelopes.length > 0) {
          await budgetDb.envelopes.bulkAdd(importData.envelopes);
        }

        if (importData.transactions && importData.transactions.length > 0) {
          await budgetDb.transactions.bulkAdd(importData.transactions);
        }

        if (importData.bills && importData.bills.length > 0) {
          await budgetDb.bills.bulkAdd(importData.bills);
        }

        if (importData.savingsGoals && importData.savingsGoals.length > 0) {
          await budgetDb.savingsGoals.bulkAdd(importData.savingsGoals);
        }

        if (importData.paycheckHistory && importData.paycheckHistory.length > 0) {
          await budgetDb.paycheckHistory.bulkAdd(importData.paycheckHistory);
        }
      });

      logger.debug("Local-only data imported successfully to Dexie", {
        totalEnvelopes: importData.metadata?.totalEnvelopes || 0,
        totalTransactions: importData.metadata?.totalTransactions || 0
      });

      return { success: true, metadata: importData.metadata };
    } catch (error) {
      logger.error("Failed to import local-only data", error);
      return { success: false, error: error.message };
    }
  },

  // Get local-only storage statistics
  getLocalOnlyStats: async () => {
    try {
      const [envelopes, transactions, bills, savingsGoals, paycheckHistory] = await Promise.all([
        budgetDb.envelopes.count(),
        budgetDb.transactions.count(),
        budgetDb.bills.count(),
        budgetDb.savingsGoals.count(),
        budgetDb.paycheckHistory.count()
      ]);

      // Estimate storage usage (this is approximate)
      const sampleData = await Promise.all([
        budgetDb.envelopes.limit(1).toArray(),
        budgetDb.transactions.limit(1).toArray(),
        budgetDb.bills.limit(1).toArray()
      ]);

      const avgSizes = {
        envelope: sampleData[0][0] ? new Blob([JSON.stringify(sampleData[0][0])]).size : 100,
        transaction: sampleData[1][0] ? new Blob([JSON.stringify(sampleData[1][0])]).size : 150,
        bill: sampleData[2][0] ? new Blob([JSON.stringify(sampleData[2][0])]).size : 120
      };

      const estimatedStorage = 
        (envelopes * avgSizes.envelope) + 
        (transactions * avgSizes.transaction) + 
        (bills * avgSizes.bill);

      const stats = {
        totalEnvelopes: envelopes,
        totalTransactions: transactions,
        totalBills: bills,
        totalSavingsGoals: savingsGoals,
        totalPaycheckHistory: paycheckHistory,
        storageSize: estimatedStorage,
        storageSizeFormatted: `${Math.round(estimatedStorage / 1024)} KB`,
        lastModified: get().localOnlyUser?.lastModified || null,
        isActive: get().isLocalOnlyMode,
        databaseName: "VioletVault (Dexie)"
      };

      return { success: true, stats };
    } catch (error) {
      logger.error("Failed to get local-only stats", error);
      return { success: false, error: error.message };
    }
  },

  // Clear all local-only data (destructive)
  clearAllLocalOnlyData: async () => {
    try {
      logger.debug("Clearing all local-only data (destructive operation)");

      // Clear all data from Dexie
      await budgetDb.transaction("rw", [budgetDb.budget, budgetDb.envelopes, budgetDb.transactions, budgetDb.bills, budgetDb.savingsGoals, budgetDb.paycheckHistory], async () => {
        await budgetDb.budget.where("id").equals("local_only_user").delete();
        await budgetDb.envelopes.clear();
        await budgetDb.transactions.clear();
        await budgetDb.bills.clear();
        await budgetDb.savingsGoals.clear();
        await budgetDb.paycheckHistory.clear();
      });

      // Clear localStorage flag
      localStorage.removeItem("localOnlyMode");

      set({
        isLocalOnlyMode: false,
        localOnlyUser: null,
        isInitialized: false
      });

      logger.debug("All local-only data cleared successfully from Dexie");
      return { success: true };
    } catch (error) {
      logger.error("Failed to clear local-only data", error);
      return { success: false, error: error.message };
    }
  }
}));