/**
 * Helper functions for useTransactionOperations hook
 * Extracted to reduce function complexity (Issue #761 - Batch 5)
 */
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";

/**
 * Create mutation configuration for adding transactions
 */
export const createAddTransactionMutationConfig = (
  queryClient: QueryClient,
  categoryRules: unknown[]
) => {
  return {
    mutationKey: ["transactions", "add"],
    mutationFn: async (transactionData: unknown) => {
      const { addTransactionToDB } = await import("./helpers/transactionOperationsHelpers");
      return addTransactionToDB(transactionData as Record<string, unknown>, categoryRules);
    },
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info("Transaction added successfully", { id: data.id });
    },
    onError: (error: Error) => {
      logger.error("Failed to add transaction", error);
    },
  };
};

/**
 * Create mutation configuration for updating transactions
 */
export const createUpdateTransactionMutationConfig = (queryClient: QueryClient) => {
  return {
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ id, updates }: { id: string; updates: unknown }) => {
      const { updateTransactionInDB } = await import("./helpers/transactionOperationsHelpers");
      return updateTransactionInDB(id, updates as Record<string, unknown>);
    },
    onSuccess: (_data: unknown, variables: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info("Transaction updated successfully", { id: variables.id });
    },
    onError: (error: Error, variables: { id: string }) => {
      logger.error("Failed to update transaction", { error, id: variables.id });
    },
  };
};

/**
 * Create mutation configuration for deleting transactions
 */
export const createDeleteTransactionMutationConfig = (queryClient: QueryClient) => {
  return {
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId: string) => {
      const { deleteTransactionFromDB } = await import("./helpers/transactionOperationsHelpers");
      return deleteTransactionFromDB(transactionId);
    },
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info("Transaction deleted successfully", { id: data.id });
    },
    onError: (error: Error, variables: string) => {
      logger.error("Failed to delete transaction", { error, id: variables });
    },
  };
};

/**
 * Create mutation configuration for splitting transactions
 */
export const createSplitTransactionMutationConfig = (queryClient: QueryClient) => {
  return {
    mutationKey: ["transactions", "split"],
    mutationFn: async ({
      originalTransaction,
      splitTransactions,
    }: {
      originalTransaction: unknown;
      splitTransactions: unknown[];
    }) => {
      const { splitTransactionInDB } = await import("./helpers/transactionOperationsHelpers");
      return splitTransactionInDB(
        originalTransaction as Record<string, unknown>,
        splitTransactions as Record<string, unknown>[]
      );
    },
    onSuccess: (data: { originalTransaction: { id: string }; splitTransactions: unknown[] }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info("Transaction split successfully", {
        originalId: data.originalTransaction.id,
        splitCount: data.splitTransactions.length,
      });
    },
    onError: (error: Error) => {
      logger.error("Failed to split transaction", error);
    },
  };
};

/**
 * Create mutation configuration for transferring funds
 */
export const createTransferFundsMutationConfig = (queryClient: QueryClient) => {
  return {
    mutationKey: ["transactions", "transfer"],
    mutationFn: async (transferData: unknown) => {
      const { transferFundsInDB } = await import("./helpers/transactionOperationsHelpers");
      return transferFundsInDB(transferData as Record<string, unknown>);
    },
    onSuccess: (data: { transferId: string; outgoing: { amount: number } }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info("Transfer created successfully", {
        transferId: data.transferId,
        amount: data.outgoing.amount,
      });
    },
    onError: (error: Error) => {
      logger.error("Failed to create transfer", error);
    },
  };
};

/**
 * Create mutation configuration for bulk operations
 */
export const createBulkOperationMutationConfig = (
  queryClient: QueryClient,
  categoryRules: unknown[]
) => {
  return {
    mutationKey: ["transactions", "bulk"],
    mutationFn: async ({
      operation,
      transactions,
      updates = {},
    }: {
      operation: string;
      transactions: unknown[];
      updates?: unknown;
    }) => {
      const { bulkOperationOnTransactions } = await import(
        "./helpers/transactionOperationsHelpers"
      );
      return bulkOperationOnTransactions(
        operation,
        transactions as Record<string, unknown>[],
        updates as Record<string, unknown>,
        categoryRules
      );
    },
    onSuccess: (data: unknown[], variables: { operation: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopesList() });
      logger.info(`Bulk ${variables.operation} completed`, { count: data.length });
    },
    onError: (error: Error, variables: { operation: string }) => {
      logger.error(`Bulk ${variables.operation} failed`, error);
    },
  };
};
