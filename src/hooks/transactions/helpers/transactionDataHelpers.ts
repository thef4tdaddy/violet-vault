/**
 * Helper functions for useTransactionData hook
 * Extracted to reduce hook complexity
 */
import type { Transaction } from "@/types/finance";
import type { Transaction as DbTransaction } from "@/db/types";

/**
 * Filter transactions by date range
 */
export const filterByDateRange = (
  transactions: Transaction[],
  startDate: Date | string,
  endDate: Date | string
): Transaction[] => {
  return transactions.filter((txn) => {
    const txnDate = new Date(txn.date);
    return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
  });
};

/**
 * Filter transactions by envelope
 */
export const filterByEnvelope = (
  transactions: Transaction[],
  envelopeId: string
): Transaction[] => {
  return transactions.filter((txn) => txn.envelopeId === envelopeId);
};

/**
 * Filter transactions by category
 */
export const filterByCategory = (
  transactions: Transaction[],
  categoryName: string
): Transaction[] => {
  return transactions.filter((txn) => txn.category?.toLowerCase() === categoryName.toLowerCase());
};

/**
 * Search transactions by query string
 */
export const searchTransactionsHelper = (
  transactions: Transaction[],
  query: string
): Transaction[] => {
  if (!query || !query.trim()) return transactions;

  const searchTerm = query.toLowerCase().trim();
  return transactions.filter((txn) => {
    const description = (txn.description || "").toLowerCase();
    const category = (txn.category || "").toLowerCase();
    const account = (txn.account || "").toLowerCase();
    const amount = Math.abs(txn.amount).toString();

    return (
      description.includes(searchTerm) ||
      category.includes(searchTerm) ||
      account.includes(searchTerm) ||
      amount.includes(searchTerm)
    );
  });
};

/**
 * Get income transactions only
 */
export const getIncomeTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter((txn) => txn.amount > 0);
};

/**
 * Get expense transactions only
 */
export const getExpenseTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter((txn) => txn.amount < 0);
};

/**
 * Get transfer transactions only
 */
export const getTransferTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter((txn) => txn.type === "transfer");
};

/**
 * Get split transactions only
 */
export const getSplitTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter((txn) => txn.isSplit || txn.parentTransactionId);
};

/**
 * Get uncategorized transactions
 */
export const getUncategorizedTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter(
    (txn) => !txn.category || txn.category.toLowerCase() === "uncategorized"
  );
};

/**
 * Get recent transactions (sorted by date, limited to count)
 */
export const getRecentTransactions = (
  transactions: Transaction[],
  count: number = 10
): Transaction[] => {
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

/**
 * Get empty statistics object
 */
export const getEmptyStats = () => ({
  total: 0,
  totalIncome: 0,
  totalExpenses: 0,
  netAmount: 0,
  averageTransaction: 0,
  categories: {},
  accounts: {},
  dateRange: { earliest: null, latest: null },
});

/**
 * Database interface for fetching transactions
 */
interface BudgetDb {
  transactions: {
    orderBy: (field: string) => {
      reverse: () => {
        toArray: () => Promise<DbTransaction[]>;
      };
    };
  };
}

/**
 * Logger interface
 */
interface Logger {
  debug: (msg: string, data?: unknown) => void;
  warn: (msg: string) => void;
  error: (msg: string, error: unknown) => void;
}

/**
 * Convert database transaction to application transaction type
 */
const dbTransactionToAppTransaction = (dbTxn: DbTransaction): Transaction => {
  return {
    id: dbTxn.id,
    date: dbTxn.date instanceof Date ? dbTxn.date.toISOString().split("T")[0] : String(dbTxn.date),
    description: dbTxn.description || dbTxn.merchant || "",
    amount: dbTxn.amount,
    category: dbTxn.category,
    envelopeId: dbTxn.envelopeId,
    type: dbTxn.type,
    createdAt: dbTxn.createdAt ? String(dbTxn.createdAt) : undefined,
  };
};

/**
 * Fetch transactions from database
 */
export const fetchTransactionsFromDb = async (
  budgetDb: BudgetDb,
  logger: Logger
): Promise<Transaction[]> => {
  logger.debug("Fetching transactions from database");

  try {
    // Get all transactions from database
    const allTransactions = await budgetDb.transactions.orderBy("date").reverse().toArray();

    if (!Array.isArray(allTransactions)) {
      logger.warn("No transactions returned from database");
      return [];
    }

    logger.debug(`Retrieved ${allTransactions.length} transactions from database`);
    return allTransactions.map(dbTransactionToAppTransaction);
  } catch (error) {
    logger.error("Error fetching transactions", error);
    throw error;
  }
};
