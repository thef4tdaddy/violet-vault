/**
 * Paycheck Transaction Service
 * Creates and manages transaction records for paycheck processing
 * Issue #1340: Ensure Proper Transaction Creation for Paycheck Processing
 */

import { v4 as uuidv4 } from "uuid";
import { budgetDb } from "@/db/budgetDb";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/db/types";

/**
 * Envelope allocation for paycheck processing
 */
interface EnvelopeAllocation {
  envelopeId: string;
  envelopeName?: string;
  amount: number;
}

/**
 * Paycheck data for transaction creation
 */
interface PaycheckData {
  paycheckId: string;
  amount: number;
  payerName?: string;
  date?: Date | string;
  notes?: string;
}

/**
 * Result of paycheck transaction creation
 */
interface PaycheckTransactionResult {
  incomeTransaction: Transaction;
  transferTransactions: Transaction[];
  incomeTransactionId: string;
  transferTransactionIds: string[];
}

/**
 * Creates transaction records for paycheck processing
 *
 * According to the simplified data model:
 * 1. Income goes to "unassigned" first (1 income transaction)
 * 2. Internal transfers distribute to envelopes (N transfer transactions)
 *
 * @param paycheckData - Paycheck data (amount, payer, etc.)
 * @param allocations - Array of envelope allocations
 * @returns Object containing created transactions and their IDs
 */
export const createPaycheckTransactions = async (
  paycheckData: PaycheckData,
  allocations: EnvelopeAllocation[]
): Promise<PaycheckTransactionResult> => {
  const timestamp = Date.now();
  const transactionDate = paycheckData.date ? new Date(paycheckData.date) : new Date();

  // 1. Create income transaction to "unassigned"
  // Use uuidv4() for guaranteed uniqueness
  const incomeTransactionData = {
    id: `income_${paycheckData.paycheckId}_${uuidv4()}`,
    date: transactionDate,
    amount: paycheckData.amount, // Positive for income
    envelopeId: "unassigned",
    category: "Income",
    type: "income" as const,
    lastModified: timestamp,
    createdAt: timestamp,
    description: `Paycheck from ${paycheckData.payerName || "Unknown"}`,
    paycheckId: paycheckData.paycheckId,
    isInternalTransfer: false,
  };

  // Validate income transaction with Zod
  const validatedIncomeTransaction = validateAndNormalizeTransaction(incomeTransactionData);

  logger.info("Creating income transaction for paycheck", {
    paycheckId: paycheckData.paycheckId,
    amount: paycheckData.amount,
    transactionId: validatedIncomeTransaction.id,
  });

  // Save income transaction to database
  await budgetDb.transactions.put(validatedIncomeTransaction as Transaction);

  // 2. Create transfer transactions from unassigned to envelopes
  const transferTransactions: Transaction[] = [];
  const transferTransactionIds: string[] = [];

  for (const allocation of allocations) {
    if (allocation.amount <= 0) continue;

    // Use uuidv4() for guaranteed uniqueness to prevent collisions
    // when multiple allocations go to the same envelope
    const transferId = `transfer_${paycheckData.paycheckId}_${allocation.envelopeId}_${uuidv4()}`;

    // Create transfer transaction (negative from unassigned perspective)
    const transferTransactionData = {
      id: transferId,
      date: transactionDate,
      amount: -allocation.amount, // Negative because it's leaving unassigned
      envelopeId: allocation.envelopeId, // Destination envelope
      category: "Transfer",
      type: "transfer" as const,
      lastModified: timestamp,
      createdAt: timestamp,
      description: `Paycheck allocation to ${allocation.envelopeName || allocation.envelopeId}`,
      paycheckId: paycheckData.paycheckId,
      isInternalTransfer: true,
      fromEnvelopeId: "unassigned",
      toEnvelopeId: allocation.envelopeId,
    };

    // Validate transfer transaction with Zod
    const validatedTransferTransaction = validateAndNormalizeTransaction(transferTransactionData);

    logger.info("Creating transfer transaction for paycheck allocation", {
      paycheckId: paycheckData.paycheckId,
      envelopeId: allocation.envelopeId,
      amount: allocation.amount,
      transactionId: validatedTransferTransaction.id,
    });

    // Save transfer transaction to database
    await budgetDb.transactions.put(validatedTransferTransaction as Transaction);

    transferTransactions.push(validatedTransferTransaction as Transaction);
    transferTransactionIds.push(validatedTransferTransaction.id);
  }

  logger.info("Paycheck transactions created successfully", {
    paycheckId: paycheckData.paycheckId,
    incomeTransactionId: validatedIncomeTransaction.id,
    transferCount: transferTransactions.length,
    transferTransactionIds,
  });

  return {
    incomeTransaction: validatedIncomeTransaction as Transaction,
    transferTransactions,
    incomeTransactionId: validatedIncomeTransaction.id,
    transferTransactionIds,
  };
};

/**
 * Deletes all transactions associated with a paycheck
 * Used when reversing/deleting a paycheck
 *
 * @param paycheckId - ID of the paycheck
 */
export const deletePaycheckTransactions = async (paycheckId: string): Promise<void> => {
  // Find all transactions linked to this paycheck
  const transactions = await budgetDb.transactions.where("paycheckId").equals(paycheckId).toArray();

  if (transactions.length === 0) {
    logger.info("No transactions found for paycheck", { paycheckId });
    return;
  }

  // Delete all associated transactions
  const transactionIds = transactions.map((t) => t.id);
  await budgetDb.transactions.bulkDelete(transactionIds);

  logger.info("Deleted paycheck transactions", {
    paycheckId,
    deletedCount: transactionIds.length,
    transactionIds,
  });
};

/**
 * Gets all transactions associated with a paycheck
 *
 * @param paycheckId - ID of the paycheck
 * @returns Array of transactions linked to the paycheck
 */
export const getPaycheckTransactions = async (paycheckId: string): Promise<Transaction[]> => {
  return budgetDb.transactions.where("paycheckId").equals(paycheckId).toArray();
};

/**
 * Checks if transactions exist for a paycheck
 *
 * @param paycheckId - ID of the paycheck
 * @returns True if transactions exist
 */
export const hasPaycheckTransactions = async (paycheckId: string): Promise<boolean> => {
  const count = await budgetDb.transactions.where("paycheckId").equals(paycheckId).count();
  return count > 0;
};

export default {
  createPaycheckTransactions,
  deletePaycheckTransactions,
  getPaycheckTransactions,
  hasPaycheckTransactions,
};
