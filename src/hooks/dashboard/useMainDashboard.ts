import { useState, useCallback, useMemo } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import { predictNextPayday } from "@/utils/budgeting/paydayPredictor";
import logger from "@/utils/common/logger";

/**
 * Generic envelope type that works with both DB and UI envelope structures
 */
interface EnvelopeData {
  id: string | number;
  name: string;
  currentBalance?: number | string;
}

/**
 * New transaction form data structure
 */
interface NewTransactionData {
  amount: string;
  description: string;
  type: "expense" | "income";
  envelopeId: string;
  date: string;
}

/**
 * Transaction data for reconciliation
 */
interface ReconcileTransactionData {
  id: string | number;
  amount: number;
  description: string;
  type: "expense" | "income";
  envelopeId: string;
  date: string;
  reconciledAt: string;
}

/**
 * Envelope option for dropdown selection
 */
interface EnvelopeOption {
  id: string | number;
  name: string;
}

/**
 * Hook for managing Main Dashboard UI state
 * Extracts UI state management from MainDashboard component
 */
export const useMainDashboardUI = () => {
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<NewTransactionData>({
    amount: "",
    description: "",
    type: "expense", // 'expense' or 'income'
    envelopeId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const openReconcileModal = useCallback(() => {
    setShowReconcileModal(true);
  }, []);

  const closeReconcileModal = useCallback(() => {
    setShowReconcileModal(false);
  }, []);

  const updateNewTransaction = useCallback((updates: Partial<NewTransactionData>) => {
    setNewTransaction((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetNewTransaction = useCallback(() => {
    setNewTransaction({
      amount: "",
      description: "",
      type: "expense",
      envelopeId: "",
      date: new Date().toISOString().split("T")[0],
    });
  }, []);

  return {
    // State
    showReconcileModal,
    newTransaction,

    // Actions
    openReconcileModal,
    closeReconcileModal,
    updateNewTransaction,
    resetNewTransaction,
  };
};

/**
 * Generic savings goal type
 */
interface SavingsGoalData {
  id?: string | number;
  currentAmount?: number;
  [key: string]: unknown;
}

/**
 * Hook for dashboard balance calculations and reconciliation logic
 * Extracts balance calculations and difference analysis
 */
export const useDashboardCalculations = (
  envelopes: EnvelopeData[] = [],
  savingsGoals: SavingsGoalData[] = [],
  unassignedCash = 0,
  actualBalance = 0
) => {
  const calculations = useMemo(() => {
    // Calculate totals
    const totalEnvelopeBalance = envelopes.reduce((sum, env) => {
      const balance = parseFloat(String(env?.currentBalance ?? 0)) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = savingsGoals.reduce((sum, goal) => {
      const amount = parseFloat(String(goal?.currentAmount)) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Ensure unassignedCash is not NaN
    const safeUnassignedCash =
      typeof unassignedCash === "number" && !isNaN(unassignedCash) ? unassignedCash : 0;
    const totalVirtualBalance = totalEnvelopeBalance + totalSavingsBalance + safeUnassignedCash;

    // Calculate difference
    const difference = actualBalance - totalVirtualBalance;
    const isBalanced = Math.abs(difference) < 0.01; // Allow for rounding differences

    // Removed noisy debug log - this calculation runs constantly

    return {
      totalEnvelopeBalance,
      totalSavingsBalance,
      safeUnassignedCash,
      totalVirtualBalance,
      difference,
      isBalanced,
    };
  }, [envelopes, savingsGoals, unassignedCash, actualBalance]);

  return calculations;
};

/**
 * Hook for handling transaction reconciliation process
 * Extracts reconciliation logic and validation
 */
export const useTransactionReconciliation = (
  reconcileTransaction: (transaction: unknown) => void,
  envelopes: EnvelopeData[],
  savingsGoals: SavingsGoalData[]
) => {
  const handleReconcileTransaction = useCallback(
    (newTransaction: NewTransactionData, onSuccess?: () => void) => {
      if (!newTransaction.amount || !newTransaction.description.trim()) {
        globalToast.showError("Please enter amount and description", "Required Fields", 8000);
        return false;
      }

      const amount = parseFloat(newTransaction.amount);
      const transaction: ReconcileTransactionData = {
        id: Date.now(),
        ...newTransaction,
        amount: newTransaction.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
        reconciledAt: new Date().toISOString(),
      };

      reconcileTransaction(transaction);
      onSuccess?.();
      return true;
    },
    [reconcileTransaction]
  );

  const handleAutoReconcileDifference = useCallback(
    (difference: number) => {
      if (difference > 0) {
        // Add difference to unassigned cash
        reconcileTransaction({
          id: Date.now(),
          amount: difference,
          description: "Balance reconciliation - added extra funds",
          type: "income",
          envelopeId: "unassigned",
          date: new Date().toISOString().split("T")[0],
          reconciledAt: new Date().toISOString(),
        });
      } else {
        // Subtract difference from unassigned cash
        reconcileTransaction({
          id: Date.now(),
          amount: difference,
          description: "Balance reconciliation - adjusted for discrepancy",
          type: "expense",
          envelopeId: "unassigned",
          date: new Date().toISOString().split("T")[0],
          reconciledAt: new Date().toISOString(),
        });
      }
    },
    [reconcileTransaction]
  );

  const getEnvelopeOptions = useCallback((): EnvelopeOption[] => {
    const options: EnvelopeOption[] = [
      { id: "unassigned", name: "Unassigned Cash" },
      ...envelopes.map((env) => ({ id: env.id, name: env.name })),
      ...savingsGoals.map((goal) => ({
        id: `savings_${goal.id}`,
        name: `💰 ${goal.name}`,
      })),
    ];
    return options;
  }, [envelopes, savingsGoals]);

  return {
    handleReconcileTransaction,
    handleAutoReconcileDifference,
    getEnvelopeOptions,
  };
};

/**
 * Hook for payday prediction and related actions
 * Extracts payday prediction logic and navigation handlers
 */
export const usePaydayManager = (
  paycheckHistory: unknown,
  setActiveView: (view: string) => void
) => {
  const paydayPrediction = useMemo(() => {
    // Cast to compatible type with index signature for predictNextPayday
    const history = paycheckHistory as
      | Array<{ date: Date | string; [key: string]: unknown }>
      | undefined;
    return history && history.length >= 2 ? predictNextPayday(history) : null;
  }, [paycheckHistory]);

  const handleProcessPaycheck = useCallback(() => {
    setActiveView("paycheck");
    logger.debug("Navigating to paycheck processor");
  }, [setActiveView]);

  const handlePrepareEnvelopes = useCallback(() => {
    globalToast.showInfo(
      "Navigate to envelope management for funding planning!",
      "Funding Planning"
    );
    // TODO: Integrate with envelope planning interface
  }, []);

  return {
    paydayPrediction,
    handleProcessPaycheck,
    handlePrepareEnvelopes,
  };
};

/**
 * Hook for dashboard data processing and display helpers
 * Provides utility functions for dashboard data rendering
 */
export const useDashboardHelpers = () => {
  const getRecentTransactions = useCallback(
    (transactions: unknown[] = [], limit = 10): unknown[] => {
      return (transactions || []).slice(0, limit);
    },
    []
  );

  const formatCurrency = useCallback((amount: number): string => {
    return `$${Math.abs(amount || 0).toFixed(2)}`;
  }, []);

  const getTransactionIcon = useCallback((amount: number): string => {
    return amount > 0 ? "TrendingUp" : "TrendingDown";
  }, []);

  const getTransactionColor = useCallback((amount: number): string => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  }, []);

  const getBalanceStatusColor = useCallback((isBalanced: boolean, difference: number): string => {
    if (isBalanced) return "bg-green-50";
    return Math.abs(difference) > 10 ? "bg-red-50" : "bg-yellow-50";
  }, []);

  const getBalanceStatusIcon = useCallback((isBalanced: boolean, difference: number): string => {
    if (isBalanced) return "CheckCircle";
    return Math.abs(difference) > 10 ? "AlertTriangle" : "AlertTriangle";
  }, []);

  return {
    getRecentTransactions,
    formatCurrency,
    getTransactionIcon,
    getTransactionColor,
    getBalanceStatusColor,
    getBalanceStatusIcon,
  };
};
