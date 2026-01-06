import { useTransactionQuery } from "../transactions/useTransactionQuery";
import { useTransactionOperations } from "../transactions/useTransactionOperations";
import { useEnvelopeOperations } from "../budgeting/useEnvelopeOperations";

/**
 * Main transaction aggregator hook.
 * Directly orchestrates consolidated query and operations hooks.
 * Maintains compatibility with legacy API while using new implementation.
 */
export const useTransactions = (options = {}) => {
  const query = useTransactionQuery(options);
  const operations = useTransactionOperations();
  const envelopeOps = useEnvelopeOperations();

  // Combine query and operations
  const combined = {
    ...query,
    ...operations,
    transferFunds: envelopeOps.transferFundsAsync, // Use envelope ops for transfers

    // Operations - maintain original method names but point to new ops
    // Legacy support for mutation objects
    addTransactionMutation: {
      mutate: operations.addTransaction,
      mutateAsync: operations.addTransaction,
      ...operations,
    },
    updateTransactionMutation: {
      mutate: operations.updateTransaction,
      mutateAsync: operations.updateTransaction,
      ...operations,
    },
    deleteTransactionMutation: {
      mutate: operations.deleteTransaction,
      mutateAsync: operations.deleteTransaction,
      ...operations,
    },

    // Legacy method aliases
    addTransactionWithRefresh: operations.addTransaction,
    updateTransactionWithRefresh: operations.updateTransaction,
    deleteTransactionWithRefresh: operations.deleteTransaction,
    // Async aliases expected by some consumers
    addTransactionAsync: operations.addTransaction,
    updateTransactionAsync: operations.updateTransaction,
    deleteTransactionAsync: operations.deleteTransaction,

    splitTransactionWithRefresh: operations.splitTransaction,
    transferFundsWithRefresh: envelopeOps.transferFundsAsync,
    bulkOperationWithRefresh: operations.bulkOperation,

    // Filter state (mapping from query hook)
    hasActiveFilters: false,
    isFilteredResult: query.transactions.length !== query.allTransactions.length,
  };

  return {
    ...combined,
    // V2 Compat Layer
    v2: {
      ...combined,
      isUsingV2: true,
      version: "2.1.0",

      // Map wrappers
      splitTransactionWithRefresh: operations.splitTransaction,
      transferFundsWithRefresh: envelopeOps.transferFundsAsync,
      bulkOperationWithRefresh: operations.bulkOperation,
    },
  };
};

export default useTransactions;
