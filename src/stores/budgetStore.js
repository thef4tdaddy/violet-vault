import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  budgetDb,
  setBudgetMetadata,
  getBudgetMetadata,
} from "../db/budgetDb.js";
import activityLogger from "../services/activityLogger.js";
import logger from "../utils/logger.js";
import {
  calculatePaycheckBalances,
  validateBalances,
} from "../utils/balanceCalculator.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = async () => {
  try {
    const oldData = localStorage.getItem("budget-store");

    // Migrate if old data exists
    if (oldData) {
      logger.info(
        "Migrating data from old budget-store to violet-vault-store",
        {
          source: "migrateOldData",
        },
      );

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
            supplementalAccounts:
              parsedOldData.state.supplementalAccounts || [],
            debts: parsedOldData.state.debts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem(
          "violet-vault-store",
          JSON.stringify(transformedData),
        );
        logger.info(
          "Data migration completed successfully - replaced existing data",
          {
            source: "migrateOldData",
          },
        );

        // Seed Dexie with migrated data so hooks can access it
        await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes);
        await budgetDb.bulkUpsertBills(transformedData.state.bills);
        await budgetDb.bulkUpsertTransactions(
          transformedData.state.allTransactions.length > 0
            ? transformedData.state.allTransactions
            : transformedData.state.transactions,
        );
        await budgetDb.bulkUpsertSavingsGoals(
          transformedData.state.savingsGoals,
        );
        await budgetDb.bulkUpsertDebts(transformedData.state.debts);
        await budgetDb.bulkUpsertPaychecks(
          transformedData.state.paycheckHistory,
        );

        // Save unassignedCash and actualBalance to Dexie metadata
        await setBudgetMetadata({
          unassignedCash: transformedData.state.unassignedCash || 0,
          actualBalance: transformedData.state.actualBalance || 0,
        });

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
  biweeklyAllocation: 0,
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
  paycheckHistory: [], // Paycheck history for payday predictions
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

  // NOTE: unassignedCash now handled by TanStack Query → Dexie, not Zustand

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
  // NOTE: actualBalance now handled by TanStack Query → Dexie, not Zustand

  // Reconcile transaction moved to TanStack Query hooks

  // Paycheck history management
  setPaycheckHistory: (history) =>
    set((state) => {
      state.paycheckHistory = history;
    }),

  processPaycheck: async (paycheck) => {
    const state = get();

    try {
      // Add to paycheck history
      set((state) => {
        state.paycheckHistory.push(paycheck);
      });

      // Get current metadata from Dexie (proper data source)
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Track remaining amount for unassigned cash calculation
      let remainingAmount = 0;

      // Create transaction for the paycheck income
      const paycheckTransaction = {
        id: `paycheck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: paycheck.date
          ? paycheck.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        description: `Paycheck from ${paycheck.payerName}`,
        amount: paycheck.amount,
        type: "income",
        category: "paycheck",
        payerName: paycheck.payerName,
        paycheckMode: paycheck.mode,
        createdAt: new Date().toISOString(),
      };

      if (paycheck.mode === "leftover") {
        // All money goes to unassigned cash
        remainingAmount = paycheck.amount;
        paycheckTransaction.envelopeId = "unassigned";
        paycheckTransaction.description += " (to unassigned cash)";

        // Note: unassigned cash will be updated in metadata save at the end

        // Create transaction for unassigned cash
        await budgetDb.transactions.put(paycheckTransaction);

        // Add transaction to state
        set((state) => {
          if (!state.transactions) state.transactions = [];
          if (!state.allTransactions) state.allTransactions = [];
          state.transactions.push(paycheckTransaction);
          state.allTransactions.push(paycheckTransaction);
        });

        logger.info("Paycheck processed to unassigned cash", {
          amount: paycheck.amount,
          payerName: paycheck.payerName,
          transactionId: paycheckTransaction.id,
        });
      } else if (paycheck.mode === "allocate") {
        // Auto-allocate to envelopes based on allocation logic
        remainingAmount = paycheck.amount;
        const transactions = [];
        const BIWEEKLY_MULTIPLIER = 2.17; // From PaycheckProcessor

        // Get current envelopes from state
        const envelopes = state.envelopes || [];

        // First, allocate to bill envelopes (higher priority)
        const billEnvelopes = envelopes.filter(
          (envelope) =>
            envelope.autoAllocate &&
            (envelope.envelopeType === "bill" ||
              ["utilities", "insurance", "housing", "transportation"].includes(
                envelope.category,
              )),
        );

        for (const envelope of billEnvelopes) {
          if (remainingAmount <= 0) break;

          const needed = Math.max(
            0,
            (envelope.biweeklyAllocation || 0) - (envelope.currentBalance || 0),
          );
          const allocation = Math.min(needed, remainingAmount);

          if (allocation > 0) {
            // Create transaction for this envelope
            const envelopeTransaction = {
              id: `paycheck_env_${envelope.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              date: paycheck.date
                ? paycheck.date.split("T")[0]
                : new Date().toISOString().split("T")[0],
              description: `Paycheck allocation from ${paycheck.payerName} to ${envelope.name}`,
              amount: allocation,
              type: "income",
              category: "paycheck-allocation",
              envelopeId: envelope.id,
              payerName: paycheck.payerName,
              paycheckMode: paycheck.mode,
              createdAt: new Date().toISOString(),
            };

            transactions.push(envelopeTransaction);

            // Update envelope balance
            set((state) => {
              const envIndex = state.envelopes.findIndex(
                (e) => e.id === envelope.id,
              );
              if (envIndex !== -1) {
                state.envelopes[envIndex].currentBalance =
                  (state.envelopes[envIndex].currentBalance || 0) + allocation;
              }
            });

            remainingAmount -= allocation;
          }
        }

        // Then, allocate to variable expense envelopes (biweekly portion of monthly budget)
        const variableEnvelopes = envelopes.filter(
          (envelope) =>
            envelope.autoAllocate &&
            envelope.envelopeType === "variable" &&
            (envelope.monthlyBudget || 0) > 0,
        );

        for (const envelope of variableEnvelopes) {
          if (remainingAmount <= 0) break;

          const biweeklyTarget =
            (envelope.monthlyBudget || 0) / BIWEEKLY_MULTIPLIER;
          const needed = Math.max(
            0,
            biweeklyTarget - (envelope.currentBalance || 0),
          );
          const allocation = Math.min(needed, remainingAmount);

          if (allocation > 0) {
            // Create transaction for this envelope
            const envelopeTransaction = {
              id: `paycheck_env_${envelope.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              date: paycheck.date
                ? paycheck.date.split("T")[0]
                : new Date().toISOString().split("T")[0],
              description: `Paycheck allocation from ${paycheck.payerName} to ${envelope.name}`,
              amount: allocation,
              type: "income",
              category: "paycheck-allocation",
              envelopeId: envelope.id,
              payerName: paycheck.payerName,
              paycheckMode: paycheck.mode,
              createdAt: new Date().toISOString(),
            };

            transactions.push(envelopeTransaction);

            // Update envelope balance
            set((state) => {
              const envIndex = state.envelopes.findIndex(
                (e) => e.id === envelope.id,
              );
              if (envIndex !== -1) {
                state.envelopes[envIndex].currentBalance =
                  (state.envelopes[envIndex].currentBalance || 0) + allocation;
              }
            });

            remainingAmount -= allocation;
          }
        }

        // Put remaining amount in unassigned cash
        if (remainingAmount > 0) {
          const unassignedTransaction = {
            id: `paycheck_unassigned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: paycheck.date
              ? paycheck.date.split("T")[0]
              : new Date().toISOString().split("T")[0],
            description: `Paycheck leftover from ${paycheck.payerName} (to unassigned cash)`,
            amount: remainingAmount,
            type: "income",
            category: "paycheck",
            envelopeId: "unassigned",
            payerName: paycheck.payerName,
            paycheckMode: paycheck.mode,
            createdAt: new Date().toISOString(),
          };

          transactions.push(unassignedTransaction);

          // Note: remaining amount will be added to unassigned cash in metadata save
        }

        // Save all transactions to Dexie and state
        for (const transaction of transactions) {
          await budgetDb.transactions.put(transaction);

          // Add transaction to state
          set((state) => {
            if (!state.transactions) state.transactions = [];
            if (!state.allTransactions) state.allTransactions = [];
            state.transactions.push(transaction);
            state.allTransactions.push(transaction);
          });
        }

        logger.info("Paycheck auto-allocated to envelopes", {
          amount: paycheck.amount,
          payerName: paycheck.payerName,
          envelopeAllocations: transactions.filter(
            (t) => t.envelopeId !== "unassigned",
          ).length,
          remainingToUnassigned: remainingAmount,
          totalTransactions: transactions.length,
        });
      }

      // Use centralized balance calculator to ensure consistency
      const currentBalances = {
        actualBalance: currentActualBalance,
        virtualBalance: 0, // Will be calculated from envelope balances if needed
        unassignedCash: currentUnassignedCash,
        isActualBalanceManual: currentMetadata?.isActualBalanceManual || false,
      };

      // Calculate envelope allocations for the centralized calculator
      const allocations = transactions
        .filter((t) => t.envelopeId !== "unassigned")
        .map((t) => ({ envelopeId: t.envelopeId, amount: t.amount }));

      // Use centralized calculator to get correct balance state
      const newBalances = calculatePaycheckBalances(
        currentBalances,
        paycheck,
        allocations,
      );

      // Validate the calculation
      const validation = validateBalances(newBalances);
      if (!validation.isValid) {
        logger.warn("Balance validation failed after paycheck processing", {
          errors: validation.errors,
          warnings: validation.warnings,
          paycheck,
        });
      }

      // Update budget metadata in Dexie with calculated values
      await setBudgetMetadata({
        unassignedCash: newBalances.unassignedCash,
        actualBalance: newBalances.actualBalance,
        isActualBalanceManual: newBalances.isActualBalanceManual,
      });

      logger.info("Paycheck processing completed successfully", {
        mode: paycheck.mode,
        amount: paycheck.amount,
        payerName: paycheck.payerName,
      });

      // Log paycheck processing activity
      try {
        await activityLogger.logPaycheckProcessed(paycheck);
      } catch (logError) {
        logger.warn("Failed to log paycheck activity:", logError);
      }

      return paycheckTransaction;
    } catch (error) {
      logger.error("Failed to process paycheck", error, {
        paycheck,
        source: "processPaycheck",
      });
      throw error;
    }
  },

  // Delete paycheck and reverse its transactions
  deletePaycheck: async (paycheckId) => {
    const state = get();

    try {
      // Find the paycheck to delete
      const paycheckIndex = state.paycheckHistory.findIndex(
        (p) => p.id === paycheckId,
      );
      if (paycheckIndex === -1) {
        throw new Error(`Paycheck with ID ${paycheckId} not found`);
      }

      const paycheck = state.paycheckHistory[paycheckIndex];

      // Find and delete related transactions
      const relatedTransactions =
        state.allTransactions?.filter(
          (t) =>
            t.payerName === paycheck.payerName &&
            t.paycheckMode === paycheck.mode &&
            t.category?.includes("paycheck") &&
            Math.abs(new Date(t.date) - new Date(paycheck.date)) <
              24 * 60 * 60 * 1000, // Within 24 hours
        ) || [];

      logger.info("Deleting paycheck and related transactions", {
        paycheckId,
        payerName: paycheck.payerName,
        amount: paycheck.amount,
        mode: paycheck.mode,
        relatedTransactions: relatedTransactions.length,
      });

      // Reverse transactions (update balances)
      for (const transaction of relatedTransactions) {
        if (transaction.envelopeId === "unassigned") {
          // Reverse unassigned cash
          set((state) => {
            state.unassignedCash = Math.max(
              0,
              (state.unassignedCash || 0) - transaction.amount,
            );
          });
        } else if (transaction.envelopeId) {
          // Reverse envelope balance
          set((state) => {
            const envIndex = state.envelopes.findIndex(
              (e) => e.id === transaction.envelopeId,
            );
            if (envIndex !== -1) {
              state.envelopes[envIndex].currentBalance = Math.max(
                0,
                (state.envelopes[envIndex].currentBalance || 0) -
                  transaction.amount,
              );
            }
          });
        }

        // Delete transaction from Dexie
        await budgetDb.transactions.delete(transaction.id);
      }

      // Remove transactions from state
      set((state) => {
        const transactionIds = relatedTransactions.map((t) => t.id);
        if (state.transactions) {
          state.transactions = state.transactions.filter(
            (t) => !transactionIds.includes(t.id),
          );
        }
        if (state.allTransactions) {
          state.allTransactions = state.allTransactions.filter(
            (t) => !transactionIds.includes(t.id),
          );
        }
      });

      // Remove paycheck from history
      set((state) => {
        state.paycheckHistory.splice(paycheckIndex, 1);
      });

      // Get current metadata and calculate reductions
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Calculate how much to reduce from unassigned cash based on deleted transactions
      const unassignedReduction = relatedTransactions
        .filter((t) => t.envelopeId === "unassigned")
        .reduce((sum, t) => sum + t.amount, 0);

      // Update budget metadata in Dexie
      await setBudgetMetadata({
        unassignedCash: Math.max(
          0,
          currentUnassignedCash - unassignedReduction,
        ),
        actualBalance: currentActualBalance - paycheck.amount,
      });

      logger.info("Paycheck deleted successfully", {
        paycheckId,
        payerName: paycheck.payerName,
        deletedTransactions: relatedTransactions.length,
      });

      // Log paycheck deletion activity
      try {
        await activityLogger.logPaycheckDeleted(paycheck);
      } catch (logError) {
        logger.warn("Failed to log paycheck deletion activity:", logError);
      }

      return true;
    } catch (error) {
      logger.error("Failed to delete paycheck", error, {
        paycheckId,
        source: "deletePaycheck",
      });
      throw error;
    }
  },

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

      if (
        !authState.encryptionKey ||
        !authState.currentUser ||
        !authState.budgetId
      ) {
        logger.warn("Missing auth context for background sync", {
          hasEncryptionKey: !!authState.encryptionKey,
          hasCurrentUser: !!authState.currentUser,
          hasBudgetId: !!authState.budgetId,
        });
        return;
      }

      // Import and start the background sync service
      const { default: CloudSyncService } = await import(
        "../services/cloudSyncService"
      );
      await CloudSyncService.start({
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
      // Always start with a clean slate to avoid data duplication
      await budgetDb.transaction(
        "rw",
        [
          budgetDb.envelopes,
          budgetDb.bills,
          budgetDb.transactions,
          budgetDb.savingsGoals,
          budgetDb.debts,
          budgetDb.paycheckHistory,
          budgetDb.budget,
        ],
        async () => {
          await budgetDb.envelopes.clear();
          await budgetDb.bills.clear();
          await budgetDb.transactions.clear();
          await budgetDb.savingsGoals.clear();
          await budgetDb.debts.clear();
          await budgetDb.paycheckHistory.clear();
          await budgetDb.budget.clear();
        },
      );

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
        const validEnvelopes = ensureValidIds(
          importedData.envelopes,
          "envelope",
        );
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
        const validTransactions = ensureValidIds(
          importedData.transactions,
          "transaction",
        );
        await budgetDb.bulkUpsertTransactions(validTransactions);
      }

      if (importedData.allTransactions?.length) {
        const validAllTransactions = ensureValidIds(
          importedData.allTransactions,
          "transaction",
        );
        await budgetDb.bulkUpsertTransactions(validAllTransactions);
      }

      if (importedData.savingsGoals?.length) {
        const validSavingsGoals = ensureValidIds(
          importedData.savingsGoals,
          "goal",
        );
        await budgetDb.bulkUpsertSavingsGoals(validSavingsGoals);
      }

      if (importedData.debts?.length) {
        const validDebts = ensureValidIds(importedData.debts, "debt");
        await budgetDb.bulkUpsertDebts(validDebts);
      }

      if (importedData.paycheckHistory?.length) {
        const validPaychecks = ensureValidIds(
          importedData.paycheckHistory,
          "paycheck",
        );
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
        budgetMetadata.isActualBalanceManual =
          importedData.isActualBalanceManual;

      if (Object.keys(budgetMetadata).length > 0) {
        await setBudgetMetadata(budgetMetadata);
        logger.info("Budget metadata saved to Dexie", {
          metadata: budgetMetadata,
        });
      }

      // Update UI state in Zustand (only UI-related fields)
      set((state) => {
        if (typeof importedData.biweeklyAllocation === "number")
          state.biweeklyAllocation = importedData.biweeklyAllocation;
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
          }),
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
        },
      );

      // Reset UI state
      set((state) => {
        state.biweeklyAllocation = 0;
        state.isUnassignedCashModalOpen = false;
        state.paycheckHistory = [];
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
        logger.auth(
          "validatePassword: No saved data, validating against auth salt",
        );

        try {
          const saltArray = new Uint8Array(authState.salt);
          const testKey = await encryptionUtils.deriveKeyFromSalt(
            password,
            saltArray,
          );

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
            logger.auth(
              "validatePassword: No current key, basic validation passed",
            );
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
        const testKey = await encryptionUtils.deriveKeyFromSalt(
          password,
          saltArray,
        );

        logger.auth("validatePassword: Key derived successfully");

        // Try to decrypt actual data to validate password
        if (encryptedData) {
          try {
            await encryptionUtils.decrypt(encryptedData, testKey);
            logger.auth(
              "validatePassword: Decryption successful - password is correct",
            );
            return true;
          } catch (decryptError) {
            logger.auth(
              "validatePassword: Decryption failed - password is incorrect",
              {
                error: decryptError.message,
              },
            );
            return false;
          }
        }

        // Fallback: if no encrypted data to test, just check if key exists
        logger.auth(
          "validatePassword: No encrypted data to test, using fallback",
        );
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
    logger.warn(
      "setDebts called - debts are now managed by TanStack Query/useDebts hook",
      {
        source: "budgetStore.setDebts",
        migration: "Use useDebts() hook instead",
      },
    );
  },
});

const base = subscribeWithSelector(immer(storeInitializer));

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
          biweeklyAllocation: state.biweeklyAllocation,
          paycheckHistory: state.paycheckHistory,
          isActualBalanceManual: state.isActualBalanceManual,
          cloudSyncEnabled: state.cloudSyncEnabled,
          isOnline: state.isOnline,
          isUnassignedCashModalOpen: state.isUnassignedCashModalOpen,
          dataLoaded: state.dataLoaded,
        }),
      }),
      { name: "violet-vault-devtools" },
    ),
  );
}

export default useOptimizedBudgetStore;

// Provide a more intuitive export alias
export { useOptimizedBudgetStore as useBudgetStore };
