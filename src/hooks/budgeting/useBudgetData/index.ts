/**
 * Unified budget data hook - refactored into modular components
 * This maintains the same API as the original monolithic useBudgetData hook
 * while internally using smaller, focused modules for better maintainability
 */

import { useBudgetQueries } from "./queries";
import { useBudgetMutations } from "./mutations";
import { usePaycheckMutations } from "./paycheckMutations";
import { useBudgetUtilities } from "./utilities";

/**
 * Unified budget data hook combining TanStack Query, Zustand, and Dexie
 * This hook provides a single interface for all budget data operations with:
 * - Smart caching via TanStack Query
 * - Real-time state via Zustand
 * - Offline persistence via Dexie
 * - Optimistic updates for better UX
 *
 * Refactored: Broken down into focused modules for maintainability
 */
const useBudgetData = () => {
  // Get all queries
  const queries = useBudgetQueries();

  // Get mutations (passing query data where needed)
  const mutations = useBudgetMutations();
  const paycheckMutations = usePaycheckMutations(queries.envelopesQuery, queries.savingsGoalsQuery);
  const utilities = useBudgetUtilities();

  // Maintain the same API as the original hook
  return {
    // Data (from TanStack Query)
    envelopes: queries.envelopes,
    transactions: queries.transactions,
    bills: queries.bills,
    savingsGoals: queries.savingsGoals,
    paycheckHistory: queries.paycheckHistory,
    dashboardSummary: queries.dashboardSummary,

    // Computed values from dashboard query
    unassignedCash: (queries.dashboardSummary as Record<string, unknown>)?.unassignedCash as number || 0,
    actualBalance: (queries.dashboardSummary as Record<string, unknown>)?.actualBalance as number || 0,

    // Loading states - maintain backward compatibility
    isLoading: queries.isLoading,
    isFetching:
      queries.envelopesQuery.isFetching ||
      queries.transactionsQuery.isFetching ||
      queries.billsQuery.isFetching ||
      queries.savingsGoalsQuery.isFetching ||
      queries.paycheckHistoryQuery.isFetching,
    isOffline: !navigator.onLine,

    // Individual query states for fine-grained loading
    envelopesLoading: queries.envelopesQuery.isLoading,
    transactionsLoading: queries.transactionsQuery.isLoading,
    billsLoading: queries.billsQuery.isLoading,
    savingsGoalsLoading: queries.savingsGoalsQuery.isLoading,
    paycheckHistoryLoading: queries.paycheckHistoryQuery.isLoading,
    dashboardLoading: queries.dashboardQuery.isLoading,

    // Mutations - maintain exact same API
    addEnvelope: mutations.addEnvelope,
    updateEnvelope: mutations.updateEnvelope,
    deleteEnvelope: mutations.deleteEnvelope,
    addTransaction: mutations.addTransaction,
    deleteTransaction: mutations.deleteTransaction,
    processPaycheck: paycheckMutations.processPaycheck,
    deletePaycheck: paycheckMutations.deletePaycheck,
    reconcileTransaction: utilities.reconcileTransaction,

    // Mutation states - maintain exact same API
    isAddingEnvelope: mutations.isAddingEnvelope,
    isUpdatingEnvelope: mutations.isUpdatingEnvelope,
    isDeletingEnvelope: mutations.isDeletingEnvelope,
    isAddingTransaction: mutations.isAddingTransaction,
    isDeletingTransaction: mutations.isDeletingTransaction,
    isProcessingPaycheck: paycheckMutations.isProcessingPaycheck,
    isDeletingPaycheck: paycheckMutations.isDeletingPaycheck,

    // Sync utilities - maintain exact same API
    syncStatus: utilities.syncStatus,
    forceSync: utilities.forceSync,
    clearCache: utilities.clearCache,
    prefetchData: utilities.prefetchData,

    // Error states - maintain exact same API
    envelopesError: queries.envelopesQuery.error,
    transactionsError: queries.transactionsQuery.error,
    billsError: queries.billsQuery.error,
    dashboardError: queries.dashboardQuery.error,
  };
};

export default useBudgetData;
