import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { budgetHistoryMiddleware } from "../utils/budgetHistoryMiddleware.js";
import { budgetDb, setBudgetMetadata } from "../db/budgetDb.js";
import logger from "../utils/logger.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = async () => {
  try {
    const oldData = localStorage.getItem("budget-store");
    const newData = localStorage.getItem("violet-vault-store");

    // Migrate if old data exists (always replace new data)
    if (oldData) {
      logger.info("Migrating data from old budget-store to violet-vault-store", {
        source: "migrateOldData",
      });

      const parsedOldData = JSON.parse(oldData);

      // Transform old reducer-based format to new direct format
      if (parsedOldData?.state) {
        const transformedData = {
          state: {
            envelopes: parsedOldData.state.envelopes || [],
            bills: parsedOldData.state.bills || [],
            transactions: parsedOldData.state.transactions || [],
            allTransactions: parsedOldData.state.allTransactions || [],
            savingsGoals: parsedOldData.state.savingsGoals || [],
            supplementalAccounts: parsedOldData.state.supplementalAccounts || [],
            debts: parsedOldData.state.debts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem("violet-vault-store", JSON.stringify(transformedData));
        logger.info("Data migration completed successfully - replaced existing data", {
          source: "migrateOldData",
        });

        // Seed Dexie with migrated data so hooks can access it
        await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes);
        await budgetDb.bulkUpsertBills(transformedData.state.bills);
        await budgetDb.bulkUpsertTransactions(
          transformedData.state.allTransactions.length > 0
            ? transformedData.state.allTransactions
            : transformedData.state.transactions
        );
        await budgetDb.bulkUpsertSavingsGoals(transformedData.state.savingsGoals);
        await budgetDb.bulkUpsertDebts(transformedData.state.debts);
        await budgetDb.bulkUpsertPaychecks(transformedData.state.paycheckHistory);

        // Remove old data after successful migration
        localStorage.removeItem("budget-store");
        logger.info("Cleaned up old budget-store data", {
          source: "migrateOldData",
        });
      }
    }
  } catch (error) {
    logger.warn("Failed to migrate old data", {
      error: error.message,
      source: "migrateOldData",
    });
  }
};

// Run migration before creating store
await migrateOldData();

// Base store configuration
const storeInitializer = (set, get) => ({
  // App State (auth, UI, settings) - data arrays handled by TanStack Query
  unassignedCash: 0,
  biweeklyAllocation: 0,
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
  paycheckHistory: [], // Paycheck history for payday predictions
  actualBalance: 0, // Real bank account balance
  isActualBalanceManual: false, // Track if balance was manually set
  isOnline: true, // Add isOnline state, default to true
  dataLoaded: false,
  cloudSyncEnabled: true, // Toggle for Firestore cloud sync (default enabled)

  // NOTE: Data arrays (envelopes, transactions, etc.) are now handled by TanStack Query → Dexie
  // Zustand only contains UI state and app settings

  // Transfer funds logic moved to TanStack Query hooks

  // Data selectors moved to TanStack Query hooks

  // Transaction operations moved to TanStack Query hooks

  // Bills operations moved to TanStack Query hooks

  // Debt operations moved to TanStack Query hooks

  // Savings goals operations moved to TanStack Query hooks

  // Supplemental accounts operations moved to TanStack Query hooks

  // Unassigned cash and allocation management
  setUnassignedCash: (amount) =>
    set((state) => {
      state.unassignedCash = amount;
      // Note: TanStack Query invalidation should be handled by calling code
      // to avoid circular dependencies between store and query client
    }),

  setBiweeklyAllocation: (amount) =>
    set((state) => {
      state.biweeklyAllocation = amount;
    }),

  // Unassigned cash modal management
  openUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = false;
    }),

  // Actual balance management
  setActualBalance: (balance, isManual = true) =>
    set((state) => {
      state.actualBalance = balance;
      state.isActualBalanceManual = isManual;
    }),

  // Reconcile transaction moved to TanStack Query hooks

  // Paycheck history management
  setPaycheckHistory: (history) =>
    set((state) => {
      state.paycheckHistory = history;
    }),

  processPaycheck: (paycheck) =>
    set((state) => {
      state.paycheckHistory.push(paycheck);
    }),

  // Data loading state
  setDataLoaded: (loaded) =>
    set((state) => {
      state.dataLoaded = loaded;
    }),

  // Start background sync service (when cloud sync is enabled)
  startBackgroundSync: async () => {
    const state = get();

    if (!state.cloudSyncEnabled) {
      logger.info("Local-only mode enabled - background sync not started", {
        cloudSyncEnabled: false,
      });
      return;
    }

    logger.info("Starting background sync service", { cloudSyncEnabled: true });

    try {
      // Get auth context from auth store
      const { useAuth } = await import("./authStore");
      const authState = useAuth.getState();

      if (!authState.encryptionKey || !authState.currentUser || !authState.budgetId) {
        logger.warn("Missing auth context for background sync", {
          hasEncryptionKey: !!authState.encryptionKey,
          hasCurrentUser: !!authState.currentUser,
          hasBudgetId: !!authState.budgetId,
        });
        return;
      }

      // Import and start the background sync service
      const { default: CloudSyncService } = await import("../services/cloudSyncService");
      CloudSyncService.start({
        encryptionKey: authState.encryptionKey,
        currentUser: authState.currentUser,
        budgetId: authState.budgetId,
      });

      logger.info("Background sync service started", {
        service: "CloudSyncService",
      });
    } catch (error) {
      logger.error("Failed to start background sync service", error, {
        service: "CloudSyncService",
      });
    }
  },

  // Add an action to set the online status
  setOnlineStatus: (status) =>
    set((state) => {
      state.isOnline = status;
    }),

  // Toggle cloud sync (Firestore)
  setCloudSyncEnabled: (enabled) =>
    set((state) => {
      state.cloudSyncEnabled = enabled;
      logger.info(`Cloud sync ${enabled ? "enabled" : "disabled"}`, {
        cloudSyncEnabled: enabled,
      });
    }),

  // Transaction cleanup moved to TanStack Query hooks

  // Load imported data - now directly to Dexie via TanStack Query hooks
  loadData: async (importedData) => {
    logger.info("Loading imported data directly to Dexie", {
      envelopes: importedData.envelopes?.length || 0,
      bills: importedData.bills?.length || 0,
      transactions: importedData.transactions?.length || 0,
      allTransactions: importedData.allTransactions?.length || 0,
      savingsGoals: importedData.savingsGoals?.length || 0,
      source: "loadData",
    });

    try {
      // Helper function to ensure records have valid IDs
      const ensureValidIds = (records, type) => {
        return records.map((record, index) => {
          if (!record.id) {
            // Generate unique ID based on content or timestamp
            const timestamp = Date.now();
            const uniqueSuffix = Math.random().toString(36).substr(2, 9);
            record.id = `${type}_${timestamp}_${index}_${uniqueSuffix}`;
            logger.debug(`Generated ID for ${type}`, {
              recordId: record.id,
              type,
            });
          }
          return record;
        });
      };

      // Load data arrays directly to Dexie with ID validation
      if (importedData.envelopes?.length) {
        const validEnvelopes = ensureValidIds(importedData.envelopes, "envelope");
        await budgetDb.bulkUpsertEnvelopes(validEnvelopes);
      }

      if (importedData.bills?.length) {
        const validBills = ensureValidIds(importedData.bills, "bill");
        logger.debug("Importing bills to Dexie", {
          count: validBills.length,
          firstBill: validBills[0],
          source: "loadData",
        });
        await budgetDb.bulkUpsertBills(validBills);

        // Verify bills were saved
        const savedBills = await budgetDb.bills.toArray();
        logger.debug("Bills verification after import", {
          savedCount: savedBills.length,
          firstSavedBill: savedBills[0],
          source: "loadData",
        });
      }

      if (importedData.transactions?.length) {
        const validTransactions = ensureValidIds(importedData.transactions, "transaction");
        await budgetDb.bulkUpsertTransactions(validTransactions);
      }

      if (importedData.allTransactions?.length) {
        const validAllTransactions = ensureValidIds(importedData.allTransactions, "transaction");
        await budgetDb.bulkUpsertTransactions(validAllTransactions);
      }

      if (importedData.savingsGoals?.length) {
        const validSavingsGoals = ensureValidIds(importedData.savingsGoals, "goal");
        await budgetDb.bulkUpsertSavingsGoals(validSavingsGoals);
      }

      if (importedData.debts?.length) {
        const validDebts = ensureValidIds(importedData.debts, "debt");
        await budgetDb.bulkUpsertDebts(validDebts);
      }

      if (importedData.paycheckHistory?.length) {
        const validPaychecks = ensureValidIds(importedData.paycheckHistory, "paycheck");
        await budgetDb.bulkUpsertPaychecks(validPaychecks);
      }

      // Save budget metadata to Dexie (unassigned cash, actual balance, etc.)
      const budgetMetadata = {};
      if (typeof importedData.unassignedCash === "number")
        budgetMetadata.unassignedCash = importedData.unassignedCash;
      if (typeof importedData.biweeklyAllocation === "number")
        budgetMetadata.biweeklyAllocation = importedData.biweeklyAllocation;
      if (typeof importedData.actualBalance === "number")
        budgetMetadata.actualBalance = importedData.actualBalance;
      if (typeof importedData.isActualBalanceManual === "boolean")
        budgetMetadata.isActualBalanceManual = importedData.isActualBalanceManual;

      if (Object.keys(budgetMetadata).length > 0) {
        await setBudgetMetadata(budgetMetadata);
        logger.info("Budget metadata saved to Dexie", { metadata: budgetMetadata });
      }

      // Update UI state in Zustand
      set((state) => {
        if (typeof importedData.unassignedCash === "number")
          state.unassignedCash = importedData.unassignedCash;
        if (typeof importedData.biweeklyAllocation === "number")
          state.biweeklyAllocation = importedData.biweeklyAllocation;
        if (typeof importedData.actualBalance === "number")
          state.actualBalance = importedData.actualBalance;
        if (typeof importedData.isActualBalanceManual === "boolean")
          state.isActualBalanceManual = importedData.isActualBalanceManual;

        state.dataLoaded = true;
      });

      logger.info("Data loaded to Dexie successfully", { source: "loadData" });

      // Force TanStack Query cache invalidation to show imported data immediately
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("importCompleted", {
            detail: { source: "loadData", dataLoaded: true },
          })
        );
        window.dispatchEvent(new CustomEvent("invalidateAllQueries"));
        logger.debug("Import cache invalidation events dispatched", {
          source: "loadData",
        });
      }, 100);
    } catch (error) {
      logger.error("Failed to load data to Dexie", error, {
        source: "loadData",
      });
    }
  },

  // Reset functionality - clears UI state and Dexie
  resetStore: async () => {
    try {
      // Clear Dexie data
      await budgetDb.transaction(
        "rw",
        budgetDb.envelopes,
        budgetDb.bills,
        budgetDb.transactions,
        budgetDb.savingsGoals,
        budgetDb.debts,
        budgetDb.paychecks,
        async () => {
          await budgetDb.envelopes.clear();
          await budgetDb.bills.clear();
          await budgetDb.transactions.clear();
          await budgetDb.savingsGoals.clear();
          await budgetDb.debts.clear();
          await budgetDb.paychecks.clear();
        }
      );

      // Reset UI state
      set((state) => {
        state.unassignedCash = 0;
        state.biweeklyAllocation = 0;
        state.isUnassignedCashModalOpen = false;
        state.paycheckHistory = [];
        state.actualBalance = 0;
        state.isActualBalanceManual = false;
        state.isOnline = true;
        state.dataLoaded = false;
      });

      // Invalidate all caches
      window.dispatchEvent(new CustomEvent("invalidateAllQueries"));
    } catch (error) {
      logger.error("Failed to reset store", error, { source: "resetStore" });
    }
  },

  // Security functionality
  validatePassword: async (password) => {
    try {
      logger.auth("validatePassword: Starting validation");

      // Import the auth store to access password validation
      const { useAuth } = await import("./authStore.jsx");
      const { encryptionUtils } = await import("../utils/encryption");

      const authState = useAuth.getState();
      const savedData = localStorage.getItem("envelopeBudgetData");

      logger.auth("validatePassword: Data check", {
        hasSavedData: !!savedData,
        hasAuthSalt: !!authState.salt,
        hasEncryptionKey: !!authState.encryptionKey,
        authStateKeys: Object.keys(authState),
      });

      // If we have no encrypted data saved yet, validate against the current auth salt
      if (!savedData && authState.salt) {
        logger.auth("validatePassword: No saved data, validating against auth salt");

        try {
          const saltArray = new Uint8Array(authState.salt);
          const testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);

          // Compare the derived key with the current encryption key if available
          if (authState.encryptionKey) {
            const keysMatch =
              JSON.stringify(Array.from(testKey)) ===
              JSON.stringify(Array.from(authState.encryptionKey));
            logger.auth("validatePassword: Key comparison result", {
              keysMatch,
            });
            return keysMatch;
          } else {
            // If no current key, just check if we can derive a key (basic validation)
            logger.auth("validatePassword: No current key, basic validation passed");
            return true;
          }
        } catch (error) {
          logger.auth("validatePassword: Auth salt validation failed", {
            error: error.message,
          });
          return false;
        }
      }

      // If we have encrypted data, validate against it (original logic)
      if (savedData && authState.salt) {
        const parsedData = JSON.parse(savedData);
        const { salt: savedSalt, encryptedData } = parsedData;
        const saltArray = new Uint8Array(savedSalt);

        logger.auth("validatePassword: Parsed data", {
          hasSavedSalt: !!savedSalt,
          hasEncryptedData: !!encryptedData,
          saltLength: saltArray.length,
        });

        // Try to derive the key with the provided password
        const testKey = await encryptionUtils.deriveKeyFromSalt(password, saltArray);

        logger.auth("validatePassword: Key derived successfully");

        // Try to decrypt actual data to validate password
        if (encryptedData) {
          try {
            await encryptionUtils.decrypt(encryptedData, testKey);
            logger.auth("validatePassword: Decryption successful - password is correct");
            return true;
          } catch (decryptError) {
            logger.auth("validatePassword: Decryption failed - password is incorrect", {
              error: decryptError.message,
            });
            return false;
          }
        }

        // Fallback: if no encrypted data to test, just check if key exists
        logger.auth("validatePassword: No encrypted data to test, using fallback");
        return !!testKey;
      }

      // If we have neither saved data nor auth salt, cannot validate
      logger.auth("validatePassword: No data or salt available for validation");
      return false;
    } catch (error) {
      logger.error("validatePassword: Validation failed with error", error, {
        source: "validatePassword",
      });
      return false;
    }
  },

  // Legacy compatibility: Debt management moved to TanStack Query hooks
  setDebts: () => {
    logger.warn("setDebts called - debts are now managed by TanStack Query/useDebts hook", {
      source: "budgetStore.setDebts",
      migration: "Use useDebts() hook instead",
    });
  },
});

const base = subscribeWithSelector(immer(budgetHistoryMiddleware(storeInitializer)));

let useOptimizedBudgetStore;

if (LOCAL_ONLY_MODE) {
  // No persistence when running in local-only mode
  useOptimizedBudgetStore = create(base);
} else {
  useOptimizedBudgetStore = create(
    devtools(
      persist(base, {
        name: "violet-vault-store",
        partialize: (state) => ({
          // UI and app state only (data arrays handled by TanStack Query → Dexie)
          unassignedCash: state.unassignedCash,
          biweeklyAllocation: state.biweeklyAllocation,
          paycheckHistory: state.paycheckHistory,
          actualBalance: state.actualBalance,
          isActualBalanceManual: state.isActualBalanceManual,
          cloudSyncEnabled: state.cloudSyncEnabled,
          isOnline: state.isOnline,
          isUnassignedCashModalOpen: state.isUnassignedCashModalOpen,
          dataLoaded: state.dataLoaded,
        }),
      }),
      { name: "violet-vault-devtools" }
    )
  );
}

export default useOptimizedBudgetStore;

// Provide a more intuitive export alias
export { useOptimizedBudgetStore as useBudgetStore };
