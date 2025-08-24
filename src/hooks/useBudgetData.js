import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/uiStore";
import {
  queryKeys,
  optimisticHelpers,
  prefetchHelpers,
} from "../utils/queryClient";
import { budgetDb, getBudgetMetadata, setBudgetMetadata } from "../db/budgetDb";
// import { useTransactions } from "./useTransactions";
import logger from "../utils/logger.js";
import {
  calculatePaycheckBalances,
  validateBalances,
} from "../utils/balanceCalculator";

/**
 * Unified budget data hook combining TanStack Query, Zustand, and Dexie
 * This hook provides a single interface for all budget data operations with:
 * - Smart caching via TanStack Query
 * - Real-time state via Zustand
 * - Offline persistence via Dexie
 * - Optimistic updates for better UX
 *
 * Fixed: Removed top-level await to prevent React #185 on Vercel
 */
const useBudgetData = () => {
  const queryClient = useQueryClient();

  // Get UI store for UI state only (data comes from TanStack Query → Dexie)
  const budgetStore = useBudgetStore();
  const {
    // UI State only
    isOnline,
    dataLoaded,
    cloudSyncEnabled,
    biweeklyAllocation,
    isUnassignedCashModalOpen,
  } = budgetStore;

  // Create reconcileTransaction mutation directly to avoid circular dependencies

  // Query functions that fetch from Dexie (primary data source)
  const queryFunctions = {
    envelopes: async () => {
      // Fetch directly from Dexie (primary data source)
      const cachedEnvelopes = await budgetDb.envelopes.toArray();
      return cachedEnvelopes || [];
    },

    transactions: async (filters = {}) => {
      // Fetch directly from Dexie (primary data source)
      let result;

      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        result = await budgetDb.getTransactionsByDateRange(start, end);
      } else {
        result = await budgetDb.transactions
          .orderBy("date")
          .reverse()
          .toArray();
      }

      // Apply additional filters
      if (filters.envelopeId) {
        result = result.filter((t) => t.envelopeId === filters.envelopeId);
      }

      return result || [];
    },

    bills: async () => {
      // Fetch directly from Dexie (primary data source)
      const cachedBills = await budgetDb.bills.toArray();
      return cachedBills || [];
    },

    savingsGoals: async () => {
      // Fetch directly from Dexie (primary data source)
      const cachedSavingsGoals = await budgetDb.savingsGoals.toArray();
      return cachedSavingsGoals || [];
    },

    paycheckHistory: async () => {
      // Use Dexie directly instead of Zustand to avoid stale data
      try {
        const cachedPaychecks = await budgetDb.paycheckHistory
          .orderBy("date")
          .reverse()
          .toArray();
        return cachedPaychecks || [];
      } catch (error) {
        logger.warn("Failed to fetch paycheck history from Dexie", error);
        return [];
      }
    },

    dashboardSummary: async () => {
      // Load budget metadata from Dexie (includes unassigned cash)
      const budgetMetadata = await getBudgetMetadata();

      // Fetch data from Dexie instead of undefined variables
      const cachedEnvelopes = await budgetDb.envelopes.toArray();
      const cachedSavingsGoals = await budgetDb.savingsGoals.toArray();
      const cachedBills = await budgetDb.bills.toArray();
      const cachedTransactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .limit(10)
        .toArray();

      // Safe calculation with NaN prevention
      const safeEnvelopes = Array.isArray(cachedEnvelopes)
        ? cachedEnvelopes
        : [];
      const safeSavingsGoals = Array.isArray(cachedSavingsGoals)
        ? cachedSavingsGoals
        : [];
      const safeBills = Array.isArray(cachedBills) ? cachedBills : [];
      const safeTransactions = Array.isArray(cachedTransactions)
        ? cachedTransactions
        : [];

      const totalEnvelopeBalance = safeEnvelopes.reduce((sum, env) => {
        const balance = parseFloat(env?.currentBalance) || 0;
        return sum + (isNaN(balance) ? 0 : balance);
      }, 0);

      const totalSavingsBalance = safeSavingsGoals.reduce((sum, goal) => {
        const amount = parseFloat(goal?.currentAmount) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Ensure all values are numbers, not NaN
      const unassignedCashValue =
        parseFloat(budgetMetadata?.unassignedCash ?? unassignedCash) || 0;
      const actualBalanceValue =
        parseFloat(budgetMetadata?.actualBalance ?? actualBalance) || 0;

      const summary = {
        totalEnvelopeBalance: isNaN(totalEnvelopeBalance)
          ? 0
          : totalEnvelopeBalance,
        totalSavingsBalance: isNaN(totalSavingsBalance)
          ? 0
          : totalSavingsBalance,
        unassignedCash: isNaN(unassignedCashValue) ? 0 : unassignedCashValue,
        actualBalance: isNaN(actualBalanceValue) ? 0 : actualBalanceValue,
        recentTransactions: safeTransactions.slice(0, 10),
        upcomingBills: safeBills.filter((bill) => {
          const dueDate = new Date(bill.dueDate);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return dueDate <= thirtyDaysFromNow;
        }),
      };

      // Calculate difference for balance reconciliation with NaN protection
      summary.virtualBalance =
        summary.totalEnvelopeBalance +
        summary.totalSavingsBalance +
        summary.unassignedCash;

      // Final NaN check
      if (isNaN(summary.virtualBalance)) {
        logger.warn("Virtual balance calculated as NaN, resetting to 0", {
          totalEnvelopeBalance: summary.totalEnvelopeBalance,
          totalSavingsBalance: summary.totalSavingsBalance,
          unassignedCash: summary.unassignedCash,
        });
        summary.virtualBalance = 0;
      }

      summary.difference = summary.actualBalance - summary.virtualBalance;
      summary.isBalanced = Math.abs(summary.difference) < 0.01;

      return summary;
    },
  };

  // TanStack Query hooks for cached data
  const envelopesQuery = useQuery({
    queryKey: queryKeys.envelopesList(),
    queryFn: queryFunctions.envelopes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactionsList(),
    queryFn: () => queryFunctions.transactions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });

  const billsQuery = useQuery({
    queryKey: queryKeys.billsList(),
    queryFn: queryFunctions.bills,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const savingsGoalsQuery = useQuery({
    queryKey: queryKeys.savingsGoalsList(),
    queryFn: queryFunctions.savingsGoals,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const paycheckHistoryQuery = useQuery({
    queryKey: queryKeys.paycheckHistory(),
    queryFn: queryFunctions.paycheckHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(),
    queryFn: queryFunctions.dashboardSummary,
    staleTime: 30 * 1000, // 30 seconds
    enabled: true,
  });

  // Event listeners for data import and sync invalidation
  useEffect(() => {
    const handleImportCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
    };

    const handleInvalidateAll = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  // NOTE: Removed Zustand subscription - unassigned cash should come from Dexie via TanStack Query
  // instead of being stored only in Zustand store

  // Reconciliation moved to manual trigger to prevent React #185
  // The async reconciliation was causing hook ordering issues in production
  // TODO: Implement as a manual user action or background service instead

  // Enhanced mutations with optimistic updates and Dexie persistence
  const addEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "add"],
    mutationFn: async (newEnvelope) => {
      // Persist to Dexie
      await optimisticHelpers.addEnvelope(newEnvelope);

      return newEnvelope;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to add envelope", error, {
        source: "addEnvelopeMutation",
      });
      // TODO: Implement rollback logic
    },
  });

  const updateEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "update"],
    mutationFn: async ({ envelopeId, updates }) => {
      // Apply optimistic update with Dexie persistence
      await optimisticHelpers.updateEnvelope(envelopeId, updates);

      return { envelopeId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const deleteEnvelopeMutation = useMutation({
    mutationKey: ["envelopes", "delete"],
    mutationFn: async (envelopeId) => {
      // Remove from cache and Dexie
      await optimisticHelpers.removeEnvelope(envelopeId);

      return envelopeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const addTransactionMutation = useMutation({
    mutationKey: ["transactions", "add"],
    mutationFn: async (newTransaction) => {
      // Apply optimistic update with Dexie persistence
      await optimisticHelpers.addTransaction(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for global stats
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Force immediate refetch for summary cards
      queryClient.refetchQueries({ queryKey: queryKeys.dashboardSummary() });
    },
  });

  // Delete transaction mutation (was missing!)
  const deleteTransactionMutation = useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      logger.info("Starting transaction deletion", { transactionId });

      // Get the transaction to check if it has an associated paycheck
      const transaction = await budgetDb.transactions.get(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // If this transaction is linked to a paycheck, delete the paycheck too
      if (transaction.paycheckId) {
        logger.info(
          "Transaction is linked to paycheck, deleting paycheck too",
          {
            transactionId,
            paycheckId: transaction.paycheckId,
          },
        );

        // Use the existing deletePaycheck logic
        // Manually delete the paycheck and reverse its effects
        try {
          const paycheckRecord = await budgetDb.paycheckHistory.get(
            transaction.paycheckId,
          );
          if (paycheckRecord) {
            // Reverse the balance changes
            const currentMetadata = await getBudgetMetadata();
            const currentActualBalance = currentMetadata?.actualBalance || 0;
            const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

            // Calculate new balances by reversing the paycheck
            const newActualBalance =
              currentActualBalance - paycheckRecord.amount;
            const unassignedCashChange =
              paycheckRecord.unassignedCashAfter -
              paycheckRecord.unassignedCashBefore;
            const newUnassignedCash =
              currentUnassignedCash - unassignedCashChange;

            // Update budget metadata
            await setBudgetMetadata({
              actualBalance: newActualBalance,
              unassignedCash: newUnassignedCash,
            });

            // Reverse envelope allocations if any
            if (paycheckRecord.envelopeAllocations?.length > 0) {
              for (const allocation of paycheckRecord.envelopeAllocations) {
                const envelope = await budgetDb.envelopes.get(
                  allocation.envelopeId,
                );
                if (envelope) {
                  const newBalance =
                    envelope.currentBalance - allocation.amount;
                  await budgetDb.envelopes.update(allocation.envelopeId, {
                    currentBalance: Math.max(0, newBalance),
                  });
                }
              }
            }

            // Delete the paycheck record
            await budgetDb.paycheckHistory.delete(transaction.paycheckId);

            logger.info("Associated paycheck deleted and effects reversed", {
              paycheckId: transaction.paycheckId,
              actualBalanceChange: newActualBalance - currentActualBalance,
              unassignedCashChange: newUnassignedCash - currentUnassignedCash,
            });

            // Also delete the transaction and return
            await budgetDb.transactions.delete(transactionId);
            return {
              success: true,
              transactionId,
              deletedPaycheck: transaction.paycheckId,
            };
          }
        } catch (error) {
          logger.error("Failed to delete associated paycheck", error);
          // Continue with just deleting the transaction
        }
      }

      // Delete the transaction
      await budgetDb.transactions.delete(transactionId);

      logger.info("Transaction deleted successfully", { transactionId });
      return { success: true, transactionId };
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for all dashboard components
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Force immediate refetch for summary cards
      queryClient.refetchQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.refetchQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.refetchQueries({ queryKey: queryKeys.actualBalance() });
    },
  });

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData) => {
      logger.info("Starting paycheck processing", {
        amount: paycheckData.amount,
        mode: paycheckData.mode,
        allocations: paycheckData.envelopeAllocations?.length || 0,
        paycheckData,
      });

      // Using statically imported functions to avoid chunk loading errors

      // Get current metadata from Dexie (proper data source)
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      logger.info("Current balances before paycheck", {
        currentActualBalance,
        currentUnassignedCash,
        currentMetadata,
      });

      // Prepare current balances for calculator
      const currentBalances = {
        actualBalance: currentActualBalance,
        virtualBalance: 0, // Will be calculated from envelope balances if needed
        unassignedCash: currentUnassignedCash,
        isActualBalanceManual: currentMetadata?.isActualBalanceManual || false,
      };

      // Prepare allocations for calculator
      const allocations =
        paycheckData.envelopeAllocations?.map((alloc) => ({
          envelopeId: alloc.envelopeId,
          amount: alloc.amount,
        })) || [];

      // Use centralized balance calculator to ensure consistency
      const newBalances = calculatePaycheckBalances(
        currentBalances,
        paycheckData,
        allocations,
      );

      // Validate the calculation
      const validation = validateBalances(newBalances);
      if (!validation.isValid) {
        logger.warn("Balance validation failed after paycheck processing", {
          errors: validation.errors,
          warnings: validation.warnings,
          paycheck: paycheckData,
          newBalances,
        });
      }

      logger.info("Calculated new balances using centralized calculator", {
        actualBalance: `${currentActualBalance} → ${newBalances.actualBalance}`,
        unassignedCash: `${currentUnassignedCash} → ${newBalances.unassignedCash}`,
        paycheckAmount: paycheckData.amount,
        paycheckMode: paycheckData.mode,
        allocationsCount: allocations.length,
      });

      // Update budget metadata in Dexie using calculated balances
      await setBudgetMetadata({
        actualBalance: newBalances.actualBalance,
        unassignedCash: newBalances.unassignedCash,
      });

      logger.info("Budget metadata updated in Dexie with validated balances");

      // Update envelope balances in Dexie if allocating
      if (allocations.length > 0) {
        logger.info("Updating envelope balances", {
          envelopeCount: allocations.length,
          allocations,
        });

        const { budgetDb } = await import("../db/budgetDb");
        for (const allocation of allocations) {
          const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
          if (envelope) {
            const oldBalance = envelope.currentBalance || 0;
            const newBalance = oldBalance + allocation.amount;

            await budgetDb.envelopes.update(allocation.envelopeId, {
              currentBalance: newBalance,
            });

            logger.debug("Updated envelope balance", {
              envelopeId: allocation.envelopeId,
              envelopeName: envelope.name,
              oldBalance,
              newBalance,
              amountAdded: allocation.amount,
            });
          } else {
            logger.warn("Envelope not found for allocation", {
              envelopeId: allocation.envelopeId,
              amount: allocation.amount,
            });
          }
        }

        logger.info("Finished updating envelope balances");
      }

      // Store paycheck in history in Dexie (FIXED: was missing this!)
      const paycheckRecord = {
        ...paycheckData,
        id: paycheckData.id || `paycheck_${Date.now()}`,
        processedAt: new Date().toISOString(),
        actualBalanceBefore: currentActualBalance,
        actualBalanceAfter: newBalances.actualBalance,
        unassignedCashBefore: currentUnassignedCash,
        unassignedCashAfter: newBalances.unassignedCash,
      };

      // Store in Dexie database (this was missing!)
      const { budgetDb } = await import("../db/budgetDb");
      await budgetDb.paycheckHistory.put(paycheckRecord);

      // Create a transaction record for the paycheck income
      const paycheckTransaction = {
        id: `paycheck_txn_${Date.now()}`,
        date: new Date().toISOString(),
        amount: paycheckData.amount,
        description: `Paycheck from ${paycheckData.payerName || "Unknown"}`,
        category: "Income",
        type: "transaction",
        envelopeId: null, // Income transactions don't belong to an envelope
        paycheckId: paycheckRecord.id, // Link to the paycheck record
        createdAt: new Date().toISOString(),
      };

      await budgetDb.transactions.put(paycheckTransaction);
      logger.info("Created paycheck transaction record", {
        transactionId: paycheckTransaction.id,
        amount: paycheckTransaction.amount,
        linkedToPaycheck: paycheckRecord.id,
      });

      logger.info("Paycheck processed successfully", {
        paycheckId: paycheckRecord.id,
        amount: paycheckData.amount,
        mode: paycheckData.mode,
        actualBalanceChange: newBalances.actualBalance - currentActualBalance,
        unassignedCashChange:
          newBalances.unassignedCash - currentUnassignedCash,
        envelopeAllocations: allocations.length,
      });

      // REMOVED: No longer calling Zustand to prevent data inconsistency
      // zustandProcessPaycheck(paycheckData);

      return paycheckRecord;
    },
    onSuccess: () => {
      // Invalidate all related queries with immediate refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });

      // Invalidate balance-related queries (critical for paycheck processing)
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });

      // Force immediate refetch of critical queries
      queryClient.refetchQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.refetchQueries({ queryKey: queryKeys.envelopes });
      queryClient.refetchQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.refetchQueries({ queryKey: queryKeys.actualBalance() });
    },
  });

  // Delete paycheck mutation (was missing!)
  const deletePaycheckMutation = useMutation({
    mutationKey: ["paychecks", "delete"],
    mutationFn: async (paycheckId) => {
      logger.info("Starting paycheck deletion", { paycheckId });

      // Get the paycheck record to reverse its effects
      const paycheckRecord = await budgetDb.paycheckHistory.get(paycheckId);
      if (!paycheckRecord) {
        throw new Error("Paycheck record not found");
      }

      logger.info("Found paycheck record to delete", {
        id: paycheckRecord.id,
        amount: paycheckRecord.amount,
        mode: paycheckRecord.mode,
        allocations: paycheckRecord.envelopeAllocations?.length || 0,
      });

      // Reverse the balance changes
      const currentMetadata = await getBudgetMetadata();
      const currentActualBalance = currentMetadata?.actualBalance || 0;
      const currentUnassignedCash = currentMetadata?.unassignedCash || 0;

      // Calculate new balances by reversing the paycheck
      const newActualBalance = currentActualBalance - paycheckRecord.amount;
      const unassignedCashChange =
        paycheckRecord.unassignedCashAfter -
        paycheckRecord.unassignedCashBefore;
      const newUnassignedCash = currentUnassignedCash - unassignedCashChange;

      // Update budget metadata
      await setBudgetMetadata({
        actualBalance: newActualBalance,
        unassignedCash: newUnassignedCash,
      });

      // Reverse envelope allocations if any
      if (paycheckRecord.envelopeAllocations?.length > 0) {
        for (const allocation of paycheckRecord.envelopeAllocations) {
          const envelope = await budgetDb.envelopes.get(allocation.envelopeId);
          if (envelope) {
            const newBalance = envelope.currentBalance - allocation.amount;
            await budgetDb.envelopes.update(allocation.envelopeId, {
              currentBalance: Math.max(0, newBalance), // Prevent negative balances
            });

            logger.debug("Reversed envelope allocation", {
              envelopeId: allocation.envelopeId,
              amountReversed: allocation.amount,
              oldBalance: envelope.currentBalance,
              newBalance: Math.max(0, newBalance),
            });
          }
        }
      }

      // Delete the paycheck transaction if it exists
      const paycheckTransactions = await budgetDb.transactions
        .where("paycheckId")
        .equals(paycheckId)
        .toArray();

      for (const transaction of paycheckTransactions) {
        await budgetDb.transactions.delete(transaction.id);
        logger.debug("Deleted paycheck transaction", {
          transactionId: transaction.id,
        });
      }

      // Delete the paycheck record
      await budgetDb.paycheckHistory.delete(paycheckId);

      logger.info("Paycheck deleted successfully", {
        paycheckId,
        actualBalanceChange: newActualBalance - currentActualBalance,
        unassignedCashChange: newUnassignedCash - currentUnassignedCash,
        envelopeAllocationsReversed:
          paycheckRecord.envelopeAllocations?.length || 0,
        transactionsDeleted: paycheckTransactions.length,
      });

      return { success: true, paycheckId };
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.actualBalance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: queryKeys.paycheckHistory() });
      queryClient.refetchQueries({ queryKey: queryKeys.envelopes });
      queryClient.refetchQueries({ queryKey: queryKeys.unassignedCash() });
      queryClient.refetchQueries({ queryKey: queryKeys.actualBalance() });
    },
  });

  // Utility functions
  const prefetchData = {
    envelopes: (filters) => prefetchHelpers.prefetchEnvelopes(filters),
    dashboard: () => prefetchHelpers.prefetchDashboard(),
    transactions: (dateRange) =>
      prefetchHelpers.prefetchTransactions(dateRange),
  };

  const syncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: localStorage.getItem("lastSyncTime"),
    hasPendingChanges: false, // TODO: Implement pending changes tracking
  };

  // Force sync function
  const forceSync = async () => {
    try {
      await queryClient.refetchQueries();
      localStorage.setItem("lastSyncTime", new Date().toISOString());
      logger.info("Force sync completed", { source: "forceSync" });
    } catch (error) {
      logger.error("Force sync failed", error, { source: "forceSync" });
      throw error;
    }
  };

  // Clear cache function
  const clearCache = async () => {
    try {
      await queryClient.clear();
      await budgetDb.cache.clear();
      logger.info("Cache cleared successfully", { source: "clearCache" });
    } catch (error) {
      logger.error("Failed to clear cache", error, { source: "clearCache" });
      throw error;
    }
  };

  // Simple reconcileTransaction mutation to avoid circular dependency
  const reconcileTransactionMutation = useMutation({
    mutationKey: ["transactions", "reconcile"],
    mutationFn: async (transactionData) => {
      await optimisticHelpers.addTransaction(transactionData);
      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
    },
  });

  return {
    // Data (from TanStack Query)
    envelopes: envelopesQuery.data || [],
    transactions: transactionsQuery.data || [],
    bills: billsQuery.data || [],
    savingsGoals: savingsGoalsQuery.data || [],
    paycheckHistory: paycheckHistoryQuery.data || [],
    dashboardSummary: dashboardQuery.data,

    // Computed values from dashboard query
    unassignedCash: dashboardQuery.data?.unassignedCash || 0,
    actualBalance: dashboardQuery.data?.actualBalance || 0,

    // Loading states
    isLoading:
      envelopesQuery.isLoading ||
      transactionsQuery.isLoading ||
      billsQuery.isLoading ||
      savingsGoalsQuery.isLoading ||
      paycheckHistoryQuery.isLoading,
    isFetching:
      envelopesQuery.isFetching ||
      transactionsQuery.isFetching ||
      billsQuery.isFetching ||
      savingsGoalsQuery.isFetching ||
      paycheckHistoryQuery.isFetching,
    isOffline: !navigator.onLine,

    // Individual query states for fine-grained loading
    envelopesLoading: envelopesQuery.isLoading,
    transactionsLoading: transactionsQuery.isLoading,
    billsLoading: billsQuery.isLoading,
    savingsGoalsLoading: savingsGoalsQuery.isLoading,
    paycheckHistoryLoading: paycheckHistoryQuery.isLoading,
    dashboardLoading: dashboardQuery.isLoading,

    // Mutations
    addEnvelope: addEnvelopeMutation.mutate,
    updateEnvelope: updateEnvelopeMutation.mutate,
    deleteEnvelope: deleteEnvelopeMutation.mutate,
    addTransaction: addTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    processPaycheck: processPaycheckMutation.mutate,
    deletePaycheck: deletePaycheckMutation.mutate,
    reconcileTransaction: reconcileTransactionMutation.mutate,

    // Mutation states
    isAddingEnvelope: addEnvelopeMutation.isPending,
    isUpdatingEnvelope: updateEnvelopeMutation.isPending,
    isDeletingEnvelope: deleteEnvelopeMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
    isProcessingPaycheck: processPaycheckMutation.isPending,
    isDeletingPaycheck: deletePaycheckMutation.isPending,

    // Sync utilities
    syncStatus,
    forceSync,
    clearCache,
    prefetchData,

    // Error states
    envelopesError: envelopesQuery.error,
    transactionsError: transactionsQuery.error,
    billsError: billsQuery.error,
    dashboardError: dashboardQuery.error,
  };
};

export default useBudgetData;
