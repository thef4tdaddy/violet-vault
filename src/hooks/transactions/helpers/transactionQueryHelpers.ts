/**
 * Helper functions for transaction query operations
 * Extracted to reduce complexity in useTransactionQuery
 */
import type { Transaction } from "../../../db/types";
import logger from "../../../utils/common/logger.ts";

interface FilterOptions {
  envelopeId?: string;
  category?: string;
  type?: 'income' | 'expense' | 'transfer';
}

interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Apply filters to transactions
 */
export const applyFilters = (
  transactions: Transaction[],
  options: FilterOptions
): Transaction[] => {
  let filtered = transactions;

  if (options.envelopeId) {
    filtered = filtered.filter((t) => t.envelopeId === options.envelopeId);
  }

  if (options.category) {
    filtered = filtered.filter((t) => t.category === options.category);
  }

  if (options.type) {
    if (options.type === "income") {
      filtered = filtered.filter((t) => t.amount > 0);
    } else if (options.type === "expense") {
      filtered = filtered.filter((t) => t.amount < 0);
    } else if (options.type === "transfer") {
      filtered = filtered.filter((t) => t.type === "transfer");
    }
  }

  return filtered;
};

/**
 * Apply sorting to transactions
 */
export const applySorting = (
  transactions: Transaction[],
  options: SortOptions
): Transaction[] => {
  const sorted = [...transactions];
  
  sorted.sort((a, b) => {
    let aVal = a[options.sortBy];
    let bVal = b[options.sortBy];

    // Handle date fields
    if (options.sortBy === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    // Handle numeric fields
    if (options.sortBy === "amount") {
      aVal = parseFloat(aVal as string) || 0;
      bVal = parseFloat(bVal as string) || 0;
    }

    if (options.sortOrder === "desc") {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });

  return sorted;
};

/**
 * Apply limit to transactions
 */
export const applyLimit = (
  transactions: Transaction[],
  limit?: number
): Transaction[] => {
  return limit ? transactions.slice(0, limit) : transactions;
};

/**
 * Seed Dexie from Zustand data if empty
 */
export const seedDexieFromZustand = async (
  dexieTransactions: Transaction[],
  zustandAllTransactions: Transaction[],
  zustandTransactions: Transaction[],
  budgetDb: { bulkUpsertTransactions: (data: Transaction[]) => Promise<void> }
): Promise<Transaction[]> => {
  const zustandData =
    zustandAllTransactions?.length > 0 ? zustandAllTransactions : zustandTransactions;
  
  if (dexieTransactions.length === 0 && zustandData && zustandData.length > 0) {
    logger.debug("TanStack Query: Seeding Dexie from Zustand", {
      zustandDataLength: zustandData.length,
      source: "useTransactionQuery",
    });
    await budgetDb.bulkUpsertTransactions(zustandData);
    return [...zustandData];
  }
  
  return dexieTransactions;
};
