/**
 * Helper functions for transaction operations
 * Extracted to reduce hook complexity
 */
import { budgetDb } from "../../../db/budgetDb.ts";
import {
  validateTransactionData,
  prepareTransactionForStorage,
  categorizeTransaction,
  createTransferPair,
} from "../../../utils/transactions/operations.ts";
import logger from "../../../utils/common/logger.ts";

interface WindowWithCloudSync extends Window {
  cloudSyncService?: {
    triggerSyncForCriticalChange: (changeType: string) => void;
  };
}

// Helper to trigger sync for transaction changes
export const triggerTransactionSync = (changeType: string) => {
  const windowObj = window as WindowWithCloudSync;
  if (typeof window !== "undefined" && windowObj.cloudSyncService) {
    windowObj.cloudSyncService.triggerSyncForCriticalChange(`transaction_${changeType}`);
  }
};

/**
 * Add transaction to database
 */
export const addTransactionToDB = async (
  transactionData: Record<string, unknown>,
  categoryRules: unknown[] = []
) => {
  logger.debug("Adding transaction", { id: transactionData.id });

  const validation = validateTransactionData(transactionData);
  if (!validation.isValid) {
    throw new Error("Invalid transaction data: " + validation.errors.join(", "));
  }

  const categorized = categorizeTransaction(transactionData, categoryRules);
  const prepared = prepareTransactionForStorage(categorized);
  await budgetDb.transactions.put(prepared);
  triggerTransactionSync("add");

  return prepared;
};

/**
 * Update transaction in database
 */
export const updateTransactionInDB = async (id: string, updates: Record<string, unknown>) => {
  logger.debug("Updating transaction", { id, updates });

  const current = await budgetDb.transactions.get(id);
  if (!current) {
    throw new Error(`Transaction not found: ${id}`);
  }

  const updatedData = { ...current, ...updates };
  const validation = validateTransactionData(updatedData);
  if (!validation.isValid) {
    throw new Error("Invalid transaction data: " + validation.errors.join(", "));
  }

  const prepared = prepareTransactionForStorage(updatedData);
  await budgetDb.transactions.put(prepared);
  triggerTransactionSync("update");

  return prepared;
};

/**
 * Delete transaction from database
 */
export const deleteTransactionFromDB = async (transactionId: string) => {
  logger.debug("Deleting transaction", { id: transactionId });
  await budgetDb.transactions.delete(transactionId);
  triggerTransactionSync("delete");
  return { id: transactionId };
};

/**
 * Split transaction in database
 */
export const splitTransactionInDB = async (
  originalTransaction: Record<string, unknown>,
  splitTransactions: Record<string, unknown>[]
) => {
  logger.debug("Splitting transaction", {
    originalId: originalTransaction.id,
    splitCount: splitTransactions.length,
  });

  // Validate all split transactions
  for (const splitTxn of splitTransactions) {
    const validation = validateTransactionData(splitTxn);
    if (!validation.isValid) {
      throw new Error(`Invalid split transaction data: ${validation.errors.join(", ")}`);
    }
  }

  const results = [];

  // Mark original transaction as split
  const updatedOriginal = {
    ...originalTransaction,
    isSplit: true,
    splitInto: splitTransactions.map((t) => t.id),
    metadata: {
      ...(originalTransaction.metadata as Record<string, unknown> | undefined),
      splitAt: new Date().toISOString(),
      splitIntoTransactions: splitTransactions.length,
    },
  };

  await budgetDb.transactions.put(updatedOriginal);

  // Add all split transactions
  for (const splitTxn of splitTransactions) {
    const prepared = prepareTransactionForStorage(splitTxn);
    await budgetDb.transactions.put(prepared);
    results.push(prepared);
  }

  triggerTransactionSync("split");

  return {
    originalTransaction: updatedOriginal,
    splitTransactions: results,
  };
};

/**
 * Transfer funds between envelopes
 */
export const transferFundsInDB = async (transferData: Record<string, unknown>) => {
  logger.debug("Creating transfer", transferData);

  const [outgoingTxn, incomingTxn] = createTransferPair(transferData);

  await budgetDb.transactions.put(prepareTransactionForStorage(outgoingTxn));
  await budgetDb.transactions.put(prepareTransactionForStorage(incomingTxn));

  triggerTransactionSync("transfer");

  return {
    outgoing: outgoingTxn,
    incoming: incomingTxn,
    transferId: (outgoingTxn.metadata as { transferId?: string } | undefined)?.transferId,
  };
};

/**
 * Perform bulk operation on transactions
 */
export const bulkOperationOnTransactions = async (
  operation: string,
  transactions: Record<string, unknown>[],
  updates: Record<string, unknown>,
  categoryRules: unknown[] = []
) => {
  logger.debug(`Bulk ${operation} operation`, { count: transactions.length });

  const results = [];

  switch (operation) {
    case "delete":
      for (const txn of transactions) {
        await budgetDb.transactions.delete(txn.id as string);
        results.push({ id: txn.id, operation: "deleted" });
      }
      break;

    case "update":
      for (const txn of transactions) {
        const updatedData = { ...txn, ...updates };
        const prepared = prepareTransactionForStorage(updatedData);
        await budgetDb.transactions.put(prepared);
        results.push(prepared);
      }
      break;

    case "categorize":
      for (const txn of transactions) {
        const categorized = categorizeTransaction({ ...txn, ...updates }, categoryRules);
        const prepared = prepareTransactionForStorage(categorized);
        await budgetDb.transactions.put(prepared);
        results.push(prepared);
      }
      break;

    default:
      throw new Error(`Unknown bulk operation: ${operation}`);
  }

  triggerTransactionSync(`bulk_${operation}`);
  return results;
};
