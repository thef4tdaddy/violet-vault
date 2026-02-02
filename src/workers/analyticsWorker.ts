/**
 * Analytics Web Worker - Offload heavy calculations to background thread
 *
 * Prevents UI blocking for large datasets (Phase 1.2)
 * Handles: heatmap generation, trend calculation, category breakdown
 */

// --- Worker Message Types ---

export interface WorkerRequest {
  id: string;
  type: "heatmap" | "trends" | "categoryBreakdown" | "quickStats";
  payload: {
    transactions: Array<{
      id: string;
      date: string | Date;
      amount: number;
      category?: string;
      envelopeId?: string;
    }>;
    periodType?: "daily" | "weekly" | "monthly";
  };
}

export interface WorkerResponse {
  id: string;
  type: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

// --- Analytics Functions (Duplicated for Worker) ---

interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  category?: string;
  envelopeId?: string;
}

interface HeatmapData {
  date: string;
  value: number;
  transactions: number;
}

interface TrendData {
  period: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
}

/**
 * Calculate daily transaction heatmap
 */
function calculateHeatmap(transactions: Transaction[]): HeatmapData[] {
  const dateMap = new Map<string, { value: number; count: number }>();

  for (const txn of transactions) {
    if (txn.amount >= 0) continue;

    const date = new Date(txn.date);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const existing = dateMap.get(dateKey);
    if (existing) {
      existing.value += Math.abs(txn.amount);
      existing.count++;
    } else {
      dateMap.set(dateKey, {
        value: Math.abs(txn.amount),
        count: 1,
      });
    }
  }

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    value: data.value,
    transactions: data.count,
  }));
}

/**
 * Calculate spending trends by period
 */
function calculateTrends(
  transactions: Transaction[],
  periodType: "daily" | "weekly" | "monthly" = "monthly"
): TrendData[] {
  const periodMap = new Map<string, { income: number; expenses: number; count: number }>();

  for (const txn of transactions) {
    const date = new Date(txn.date);
    let periodKey: string;

    if (periodType === "daily") {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    } else if (periodType === "weekly") {
      // Simplified week number calculation (not ISO-compliant)
      // Note: This is an approximation and doesn't handle cross-year/month boundaries correctly
      // For production use, consider implementing proper ISO 8601 week date calculation
      const weekNum = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
      periodKey = `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    } else {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = periodMap.get(periodKey);
    const isIncome = txn.amount > 0;
    const amount = Math.abs(txn.amount);

    if (existing) {
      if (isIncome) {
        existing.income += amount;
      } else {
        existing.expenses += amount;
      }
      existing.count++;
    } else {
      periodMap.set(periodKey, {
        income: isIncome ? amount : 0,
        expenses: isIncome ? 0 : amount,
        count: 1,
      });
    }
  }

  return Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate category breakdown
 */
function calculateCategoryBreakdown(transactions: Transaction[]): Array<{
  category: string;
  amount: number;
  count: number;
  percentage: number;
}> {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalExpenses = 0;

  for (const txn of transactions) {
    if (txn.amount >= 0) continue;

    const category = txn.category || "Uncategorized";
    const amount = Math.abs(txn.amount);
    totalExpenses += amount;

    const existing = categoryMap.get(category);
    if (existing) {
      existing.amount += amount;
      existing.count++;
    } else {
      categoryMap.set(category, { amount, count: 1 });
    }
  }

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get quick summary statistics
 */
function getQuickStats(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
  avgTransaction: number;
} {
  let totalIncome = 0;
  let totalExpenses = 0;
  const count = transactions.length;

  for (const txn of transactions) {
    if (txn.amount > 0) {
      totalIncome += txn.amount;
    } else {
      totalExpenses += Math.abs(txn.amount);
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const avgTransaction = count > 0 ? (totalIncome + totalExpenses) / count : 0;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    transactionCount: count,
    avgTransaction,
  };
}

// --- Worker Message Handler ---

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;
  const startTime = performance.now();

  try {
    let data: unknown;

    switch (type) {
      case "heatmap":
        data = calculateHeatmap(payload.transactions);
        break;

      case "trends":
        data = calculateTrends(payload.transactions, payload.periodType || "monthly");
        break;

      case "categoryBreakdown":
        data = calculateCategoryBreakdown(payload.transactions);
        break;

      case "quickStats":
        data = getQuickStats(payload.transactions);
        break;

      default:
        throw new Error(`Unknown worker request type: ${type}`);
    }

    const duration = performance.now() - startTime;

    const response: WorkerResponse = {
      id,
      type,
      success: true,
      data,
      duration,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: performance.now() - startTime,
    };

    self.postMessage(response);
  }
};
