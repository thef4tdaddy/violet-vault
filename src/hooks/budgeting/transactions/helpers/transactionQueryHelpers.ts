/**
 * Helper functions for transaction query operations
 * Extracted to reduce complexity in useTransactionQuery
 */
import type { Transaction } from "@/db/types";
import logger from "@/utils/core/common/logger";

interface FilterOptions {
  envelopeId?: string;
  category?: string;
  type?: "income" | "expense" | "transfer";
}

interface SortOptions {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * Compare two date values
 */
const compareDates = (aVal: unknown, bVal: unknown, sortOrder: "asc" | "desc"): number => {
  const aDate = new Date(aVal as Date | string);
  const bDate = new Date(bVal as Date | string);

  if (sortOrder === "desc") {
    return bDate > aDate ? 1 : bDate < aDate ? -1 : 0;
  }
  return aDate > bDate ? 1 : aDate < bDate ? -1 : 0;
};

/**
 * Compare two numeric values
 */
const compareNumbers = (aVal: unknown, bVal: unknown, sortOrder: "asc" | "desc"): number => {
  const aNum = typeof aVal === "number" ? aVal : parseFloat(String(aVal)) || 0;
  const bNum = typeof bVal === "number" ? bVal : parseFloat(String(bVal)) || 0;

  if (sortOrder === "desc") {
    return bNum > aNum ? 1 : bNum < aNum ? -1 : 0;
  }
  return aNum > bNum ? 1 : aNum < bNum ? -1 : 0;
};

/**
 * Compare two string values
 */
const compareStrings = (aVal: unknown, bVal: unknown, sortOrder: "asc" | "desc"): number => {
  const aStr = String(aVal ?? "");
  const bStr = String(bVal ?? "");
  if (sortOrder === "desc") {
    return bStr > aStr ? 1 : bStr < aStr ? -1 : 0;
  }
  return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
};

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
export const applySorting = (transactions: Transaction[], options: SortOptions): Transaction[] => {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    // Safely access the property with proper typing
    const aVal = a[options.sortBy as keyof Transaction];
    const bVal = b[options.sortBy as keyof Transaction];

    // Handle date fields
    if (options.sortBy === "date") {
      return compareDates(aVal, bVal, options.sortOrder);
    }

    // Handle numeric fields
    if (options.sortBy === "amount") {
      return compareNumbers(aVal, bVal, options.sortOrder);
    }

    // Handle string fields
    return compareStrings(aVal, bVal, options.sortOrder);
  });

  return sorted;
};

/**
 * Apply limit to transactions
 */
export const applyLimit = (transactions: Transaction[], limit?: number): Transaction[] => {
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
