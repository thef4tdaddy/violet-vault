/**
 * Pure calculation utilities for analytics
 */

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category?: string;
  envelopeId?: string;
  type?: string;
}

interface Envelope {
  id: string;
  name: string;
  currentBalance?: number;
  targetAmount?: number;
}

interface CategoryBreakdown {
  [category: string]: {
    income: number;
    expenses: number;
    net: number;
    count: number;
    transactions: Transaction[];
  };
}

interface EnvelopeBreakdown {
  [envelopeName: string]: {
    income: number;
    expenses: number;
    net: number;
    count: number;
    envelopeId: string;
  };
}

/**
 * Calculate basic financial summary from transactions
 */
export const calculateFinancialSummary = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  );

  const netAmount = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount: transactions.length,
  };
};

/**
 * Generate category breakdown from transactions
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]): CategoryBreakdown => {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = {
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        transactions: [],
      };
    }

    if (transaction.amount > 0) {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += Math.abs(transaction.amount);
    }

    acc[category].net += transaction.amount;
    acc[category].count += 1;
    acc[category].transactions.push(transaction);

    return acc;
  }, {} as CategoryBreakdown);
};

/**
 * Generate envelope breakdown from transactions
 */
export const calculateEnvelopeBreakdown = (
  transactions: Transaction[],
  envelopes: Envelope[] = []
): EnvelopeBreakdown => {
  return transactions.reduce((acc, transaction) => {
    if (!transaction.envelopeId) return acc;

    const envelope = envelopes.find((env) => env.id === transaction.envelopeId);
    const envelopeName = envelope?.name || "Unknown Envelope";

    if (!acc[envelopeName]) {
      acc[envelopeName] = {
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        envelopeId: transaction.envelopeId,
      };
    }

    if (transaction.amount > 0) {
      acc[envelopeName].income += transaction.amount;
    } else {
      acc[envelopeName].expenses += Math.abs(transaction.amount);
    }

    acc[envelopeName].net += transaction.amount;
    acc[envelopeName].count += 1;

    return acc;
  }, {} as EnvelopeBreakdown);
};

/**
 * Generate time series data for charts
 */
export const calculateTimeSeriesData = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
) => {
  const timeSeriesData = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === currentDate.toDateString();
    });

    const dayIncome = dayTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const dayExpenses = Math.abs(
      dayTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    );

    timeSeriesData.push({
      date: new Date(currentDate),
      income: dayIncome,
      expenses: dayExpenses,
      net: dayIncome - dayExpenses,
      transactionCount: dayTransactions.length,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeSeriesData;
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Filter out transfer transactions if not included
 */
export const filterTransferTransactions = (
  transactions: Transaction[],
  includeTransfers: boolean
): Transaction[] => {
  if (includeTransfers) return transactions;
  return transactions.filter((t) => t.type !== "transfer");
};
