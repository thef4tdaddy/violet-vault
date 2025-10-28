/**
 * Helper functions for transaction operations
 * Extracted to reduce hook complexity
 */
import { budgetDb } from "@/db/budgetDb";
import type { Transaction as DbTransaction } from "@/db/types";
import {
  validateTransactionData,
  prepareTransactionForStorage,
  categorizeTransaction,
  createTransferPair,
} from "@/utils/transactions/operations";
import logger from "@/utils/common/logger";

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
 * Convert app transaction to database transaction
 */
const appTransactionToDbTransaction = (
  appTxn: ReturnType<typeof prepareTransactionForStorage>
): DbTransaction => {
  return {
    id: String(appTxn.id),
    date: new Date(appTxn.date),
    amount: appTxn.amount,
    envelopeId: String(appTxn.envelopeId || ""),
    category: appTxn.category || "",
    type: appTxn.type || "expense",
    lastModified: Date.now(),
    createdAt: Date.now(),
    description: appTxn.description,
    merchant: appTxn.description,
    receiptUrl: appTxn.metadata?.receiptUrl as string | undefined,
  };
};

/**
 * Helper to cast unknown data to TransactionBase type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toTransactionBase = (data: any): Parameters<typeof prepareTransactionForStorage>[0] => {
  return data as Parameters<typeof prepareTransactionForStorage>[0];
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
  const dbTransaction = appTransactionToDbTransaction(prepared);
  const result = await budgetDb.transactions.add(dbTransaction);
  triggerTransactionSync("add");

  return result;
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

  const updatedData = { ...current, ...updates } as Record<string, unknown>;
  const validation = validateTransactionData(updatedData);
  if (!validation.isValid) {
    throw new Error("Invalid transaction data: " + validation.errors.join(", "));
  }

  const prepared = prepareTransactionForStorage(toTransactionBase(updatedData));
  const dbTransaction = appTransactionToDbTransaction(prepared);
  await budgetDb.transactions.put(dbTransaction);
  triggerTransactionSync("update");

  return dbTransaction;
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

  const preparedOriginal = prepareTransactionForStorage(toTransactionBase(updatedOriginal));
  const dbOriginal = appTransactionToDbTransaction(preparedOriginal);
  await budgetDb.transactions.put(dbOriginal);

  // Add all split transactions
  for (const splitTxn of splitTransactions) {
    const prepared = prepareTransactionForStorage(toTransactionBase(splitTxn));
    const dbTransaction = appTransactionToDbTransaction(prepared);
    const result = await budgetDb.transactions.add(dbTransaction);
    results.push(result);
  }

  triggerTransactionSync("split");

  return {
    originalTransaction: dbOriginal,
    splitTransactions: results,
  };
};

/**
 * Transfer funds between envelopes
 */
export const transferFundsInDB = async (transferData: Record<string, unknown>) => {
  logger.debug("Creating transfer", transferData);

  const [outgoingTxn, incomingTxn] = createTransferPair(toTransactionBase(transferData));

  const dbOutgoing = appTransactionToDbTransaction(
    prepareTransactionForStorage(toTransactionBase(outgoingTxn))
  );
  const dbIncoming = appTransactionToDbTransaction(
    prepareTransactionForStorage(toTransactionBase(incomingTxn))
  );

  const outgoingResult = await budgetDb.transactions.add(dbOutgoing);
  const incomingResult = await budgetDb.transactions.add(dbIncoming);

  triggerTransactionSync("transfer");

  return {
    outgoing: outgoingResult,
    incoming: incomingResult,
    transferId: outgoingTxn.metadata?.transferId,
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
        await budgetDb.transactions.delete(String(txn.id));
        results.push({ id: txn.id, operation: "deleted" });
      }
      break;

    case "update":
      for (const txn of transactions) {
        const updatedData = { ...txn, ...updates };
        const prepared = prepareTransactionForStorage(toTransactionBase(updatedData));
        const dbTransaction = appTransactionToDbTransaction(prepared);
        await budgetDb.transactions.put(dbTransaction);
        results.push(dbTransaction);
      }
      break;

    case "categorize":
      for (const txn of transactions) {
        const categorized = categorizeTransaction(
          toTransactionBase({ ...txn, ...updates }),
          categoryRules
        );
        const prepared = prepareTransactionForStorage(toTransactionBase(categorized));
        const dbTransaction = appTransactionToDbTransaction(prepared);
        await budgetDb.transactions.put(dbTransaction);
        results.push(dbTransaction);
      }
      break;

    default:
      throw new Error(`Unknown bulk operation: ${operation}`);
  }

  triggerTransactionSync(`bulk_${operation}`);
  return results;
};
