import { useState, useCallback, useMemo } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { predictNextPayday } from "../../utils/budgeting/paydayPredictor";
import logger from "../../utils/common/logger";

/**
 * Hook for managing Main Dashboard UI state
 * Extracts UI state management from MainDashboard component
 */
export const useMainDashboardUI = () => {
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
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

  const updateNewTransaction = useCallback((updates) => {
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
 * Hook for dashboard balance calculations and reconciliation logic
 * Extracts balance calculations and difference analysis
 */
export const useDashboardCalculations = (
  envelopes = [],
  savingsGoals = [],
  unassignedCash = 0,
  actualBalance = 0
) => {
  const calculations = useMemo(() => {
    // Calculate totals
    const totalEnvelopeBalance = envelopes.reduce((sum, env) => {
      const balance = parseFloat(env?.currentBalance) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = savingsGoals.reduce((sum, goal) => {
      const amount = parseFloat(String(goal?.currentAmount)) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Ensure unassignedCash is not NaN
    const safeUnassignedCash = typeof unassignedCash === 'number' && !isNaN(unassignedCash) ? unassignedCash : 0;
    const totalVirtualBalance =
      totalEnvelopeBalance +
      totalSavingsBalance +
      safeUnassignedCash;

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
export const useTransactionReconciliation = (reconcileTransaction, envelopes, savingsGoals) => {
  const handleReconcileTransaction = useCallback(
    (newTransaction, onSuccess) => {
      if (!newTransaction.amount || !newTransaction.description.trim()) {
        globalToast.showError("Please enter amount and description", "Required Fields", 8000);
        return false;
      }

      const amount = parseFloat(newTransaction.amount);
      const transaction = {
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
    (difference) => {
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

  const getEnvelopeOptions = useCallback(() => {
    const options = [
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
export const usePaydayManager = (paycheckHistory, setActiveView) => {
  const paydayPrediction = useMemo(() => {
    return paycheckHistory && paycheckHistory.length >= 2
      ? predictNextPayday(paycheckHistory)
      : null;
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
  const getRecentTransactions = useCallback((transactions = [], limit = 10) => {
    return (transactions || []).slice(0, limit);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return `$${Math.abs(amount || 0).toFixed(2)}`;
  }, []);

  const getTransactionIcon = useCallback((amount) => {
    return amount > 0 ? "TrendingUp" : "TrendingDown";
  }, []);

  const getTransactionColor = useCallback((amount) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  }, []);

  const getBalanceStatusColor = useCallback((isBalanced, difference) => {
    if (isBalanced) return "bg-green-50";
    return Math.abs(difference) > 10 ? "bg-red-50" : "bg-yellow-50";
  }, []);

  const getBalanceStatusIcon = useCallback((isBalanced, difference) => {
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
