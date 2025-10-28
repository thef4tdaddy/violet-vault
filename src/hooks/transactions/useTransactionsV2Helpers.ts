/**
 * Helper functions for useTransactionsV2 hook
 * Extracted to reduce function complexity (Issue #761 - Batch 5)
 */
import logger from "@/utils/common/logger";

/**
 * Create enhanced operations that combine data refresh with CRUD operations
 */
export const createEnhancedOperations = (operationsHook: unknown, dataHook: unknown) => {
  const ops = operationsHook as {
    addTransaction: (data: unknown) => Promise<unknown>;
    updateTransaction: (id: string, updates: unknown) => Promise<unknown>;
    deleteTransaction: (id: string) => Promise<unknown>;
    splitTransaction: (original: unknown, splits: unknown[]) => Promise<unknown>;
    transferFunds: (data: unknown) => Promise<unknown>;
    bulkOperation: (op: string, trans: unknown[], updates: unknown) => Promise<unknown>;
  };

  const data = dataHook as {
    refetch: () => Promise<unknown>;
  };

  return {
    /**
     * Add transaction with automatic data refresh
     */
    addTransactionWithRefresh: async (transactionData: unknown) => {
      try {
        const result = await ops.addTransaction(transactionData);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to add transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Update transaction with automatic data refresh
     */
    updateTransactionWithRefresh: async (id: string, updates: unknown) => {
      try {
        const result = await ops.updateTransaction(id, updates);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to update transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Delete transaction with automatic data refresh
     */
    deleteTransactionWithRefresh: async (transactionId: string) => {
      try {
        const result = await ops.deleteTransaction(transactionId);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to delete transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Split transaction with automatic data refresh
     */
    splitTransactionWithRefresh: async (
      originalTransaction: unknown,
      splitTransactions: unknown[]
    ) => {
      try {
        const result = await ops.splitTransaction(originalTransaction, splitTransactions);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to split transaction with refresh", error);
        throw error;
      }
    },

    /**
     * Transfer funds with automatic data refresh
     */
    transferFundsWithRefresh: async (transferData: unknown) => {
      try {
        const result = await ops.transferFunds(transferData);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error("Failed to transfer funds with refresh", error);
        throw error;
      }
    },

    /**
     * Bulk operation with automatic data refresh
     */
    bulkOperationWithRefresh: async (
      operation: string,
      transactions: unknown[],
      updates: unknown
    ) => {
      try {
        const result = await ops.bulkOperation(operation, transactions, updates);
        await data.refetch();
        return result;
      } catch (error) {
        logger.error(`Failed to perform bulk ${operation} with refresh`, error);
        throw error;
      }
    },
  };
};
