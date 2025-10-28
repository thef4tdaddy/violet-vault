interface Transaction {
  amount: number;
  description: string;
  date?: string | number;
  envelopeId?: string;
  [key: string]: unknown;
}

/**
 * Checks if transaction is valid
 */
export const isValidTransaction = (transaction: unknown): boolean => {
  return Boolean(
    transaction &&
    typeof transaction === "object" &&
    typeof (transaction as Record<string, unknown>).amount === "number" &&
    (transaction as Record<string, unknown>).description
  );
};

/**
 * Checks if transaction matches search term
 */
export const matchesSearchTerm = (transaction: Transaction, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  return transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Checks if transaction matches type filter
 */
export const matchesTypeFilter = (transaction: Transaction, typeFilter: string): boolean => {
  if (typeFilter === "all") return true;
  if (typeFilter === "income") return transaction.amount > 0;
  if (typeFilter === "expense") return transaction.amount < 0;
  return true;
};

/**
 * Checks if transaction matches envelope filter
 */
export const matchesEnvelopeFilter = (
  transaction: Transaction,
  envelopeFilter: string
): boolean => {
  if (envelopeFilter === "all") return true;
  return transaction.envelopeId === envelopeFilter;
};

/**
 * Checks if transaction matches date filter
 */
export const matchesDateFilter = (transaction: Transaction, dateFilter: string): boolean => {
  if (dateFilter === "all") return true;

  const transactionDate = new Date(transaction.date || 0);
  const now = new Date();

  if (dateFilter === "today") {
    return transactionDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return transactionDate >= weekAgo;
  }

  if (dateFilter === "month") {
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
};

/**
 * Gets sort value for transaction based on sort field
 */
export const getSortValue = (
  transaction: Transaction,
  sortBy: string
): Date | number | string | null => {
  switch (sortBy) {
    case "date":
      return new Date(transaction.date || 0);
    case "amount":
      return Math.abs(transaction.amount || 0);
    case "description":
      return (transaction.description || "").toLowerCase();
    default:
      return null;
  }
};

/**
 * Compares transactions for sorting
 */
export const compareTransactions = (
  a: Transaction | null | undefined,
  b: Transaction | null | undefined,
  sortBy: string,
  sortOrder: string
): number => {
  if (!a || !b) return 0;

  const aVal = getSortValue(a, sortBy);
  const bVal = getSortValue(b, sortBy);

  if (aVal === null || bVal === null) return 0;

  const comparison = aVal > bVal ? 1 : -1;
  return sortOrder === "asc" ? comparison : -comparison;
};
