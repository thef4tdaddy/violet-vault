/**
 * Helper functions for useExportData hook
 * Extracted to reduce complexity
 */

/**
 * Build export metadata
 */
const buildExportMetadata = (
  currentUser: { userName?: string; budgetId?: string; userColor?: string } | null
) => ({
  exportedBy: currentUser?.userName || "Unknown User",
  exportDate: new Date().toISOString(),
  appVersion: "1.8.0",
  dataVersion: "2.0",
  dataSource: "dexie",
  exportedFrom: "develop-branch",
  budgetId: currentUser?.budgetId,
  userColor: currentUser?.userColor,
  syncContext: {
    note: "This data was encrypted with a specific budgetId. Import will create new encryption context.",
    originalBudgetId: currentUser?.budgetId,
    exportTimestamp: Date.now(),
  },
});

/**
 * Build data guide
 */
const buildDataGuide = () => ({
  note: "For mass updates, use these primary arrays:",
  primaryArrays: {
    envelopes: "Main envelope data - edit currentBalance, name, category, etc.",
    bills: "Bill payment data - edit amount, dueDate, provider, etc.",
    debts: "Debt tracking data - edit currentBalance, minimumPayment, etc.",
    savingsGoals: "Savings goal data - edit targetAmount, currentAmount, etc.",
    paycheckHistory: "Paycheck history for trend analysis",
    transactions: "Pure transactions only (filtered from allTransactions)",
    allTransactions: "All transactions + bills combined (auto-generated, don't edit directly)",
    auditLog: "Change history and audit trail (generally shouldn't be edited)",
  },
  deprecatedArrays: {
    note: "These may exist from old exports but are not actively used in v1.8+",
    examples: ["updatedEnvelopes", "oldTransactions"],
  },
  importInstructions:
    "Edit 'envelopes', 'bills', or 'transactions' arrays, then re-import. The app will rebuild 'allTransactions' automatically.",
});

/**
 * Construct export object with all data and metadata
 */
export const constructExportObject = (
  data: unknown[],
  currentUser: { userName?: string; budgetId?: string; userColor?: string } | null
) => {
  const [envelopes, bills, transactions, savingsGoals, debts, paycheckHistory, auditLog, metadata] =
    data as [
      unknown[],
      unknown[],
      Array<{ type?: string }>,
      unknown[],
      unknown[],
      unknown[],
      unknown[],
      (
        | {
            supplementalAccounts?: unknown[];
            unassignedCash?: number;
            biweeklyAllocation?: number;
            actualBalance?: number;
            isActualBalanceManual?: boolean;
          }
        | undefined
      ),
    ];

  const pureTransactions = transactions.filter((t) => !t.type || t.type === "transaction");

  return {
    envelopes,
    bills,
    transactions: pureTransactions,
    allTransactions: transactions,
    savingsGoals,
    supplementalAccounts: metadata?.supplementalAccounts || [],
    debts,
    paycheckHistory,
    auditLog,
    unassignedCash: metadata?.unassignedCash || 0,
    biweeklyAllocation: metadata?.biweeklyAllocation || 0,
    actualBalance: metadata?.actualBalance || 0,
    isActualBalanceManual: metadata?.isActualBalanceManual || false,
    exportMetadata: buildExportMetadata(currentUser),
    _dataGuide: buildDataGuide(),
  };
};
