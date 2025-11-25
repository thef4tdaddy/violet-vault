import { useState, useCallback, useMemo } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import { predictNextPayday, type PaycheckEntry } from "../../utils/budgeting/paydayPredictor";
import logger from "../../utils/common/logger";
import type { UseMutateFunction } from "@tanstack/react-query";
import type {
  Envelope as DbEnvelope,
  SavingsGoal as DbSavingsGoal,
  Transaction as DbTransaction,
  PaycheckHistory,
} from "@/db/types";

// Type definitions for dashboard
type Envelope = DbEnvelope;
type SavingsGoal = DbSavingsGoal;
type PaycheckHistoryItem = PaycheckHistory;

interface TransactionFormState {
  amount?: string;
  description?: string;
  type?: "expense" | "income";
  envelopeId?: string;
  category?: string;
  date?: string;
}

type ReconcileInput = Omit<DbTransaction, "lastModified" | "createdAt">;

interface EnvelopeOption {
  id: string;
  name: string;
}

/**
 * Hook for managing Main Dashboard UI state
 * Extracts UI state management from MainDashboard component
 */
export const useMainDashboardUI = () => {
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionFormState>({
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

  const updateNewTransaction = useCallback((updates: Partial<TransactionFormState>) => {
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
  envelopes: Envelope[] = [],
  savingsGoals: SavingsGoal[] = [],
  unassignedCash: number = 0,
  actualBalance: number = 0
) => {
  const calculations = useMemo(() => {
    // Calculate totals
    const totalEnvelopeBalance = envelopes.reduce((sum, env) => {
      const balance = parseFloat(String(env?.currentBalance || "0")) || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const totalSavingsBalance = savingsGoals.reduce((sum, goal) => {
      const amount = parseFloat(String(goal?.currentAmount || "0")) || 0;
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
  reconcileTransaction: UseMutateFunction<ReconcileInput, Error, ReconcileInput, unknown>,
  envelopes: Envelope[] = [],
  savingsGoals: SavingsGoal[] = []
) => {
  const handleReconcileTransaction = useCallback(
    (newTransaction: TransactionFormState, onSuccess?: () => void) => {
      if (!newTransaction.amount || !newTransaction.description?.trim()) {
        globalToast.showError("Please enter amount and description", "Required Fields", 8000);
        return false;
      }

      const amount = parseFloat(newTransaction.amount || "0");
      const isExpense = (newTransaction.type || "expense") === "expense";
      const transaction: ReconcileInput = {
        id: (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()) as string,
        date: newTransaction.date ? new Date(newTransaction.date) : new Date(),
        amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
        envelopeId: newTransaction.envelopeId || "unassigned",
        category: newTransaction.category || "other",
        type: newTransaction.type || (isExpense ? "expense" : "income"),
        description: newTransaction.description?.trim() || "Reconciled transaction",
        merchant: undefined,
        receiptUrl: undefined,
        notes: undefined,
      };

      reconcileTransaction(transaction, {
        onSuccess,
        onError: (error) => {
          logger.error("Failed to reconcile transaction", { error });
          globalToast.showError("Could not reconcile transaction", "Error", 8000);
        },
      });
      return true;
    },
    [reconcileTransaction]
  );

  const handleAutoReconcileDifference = useCallback(
    (difference: number) => {
      // Validate difference
      if (!difference || Math.abs(difference) < 0.01) {
        logger.warn("Auto-reconcile called with invalid difference", { difference });
        return;
      }

      try {
        const isIncome = difference > 0;
        const transaction: ReconcileInput = {
          id: (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()) as string,
          date: new Date(),
          amount: isIncome ? Math.abs(difference) : -Math.abs(difference),
          description: isIncome
            ? "Balance reconciliation - added extra funds"
            : "Balance reconciliation - adjusted for discrepancy",
          type: isIncome ? "income" : "expense",
          envelopeId: "unassigned",
          category: "other",
          merchant: undefined,
          receiptUrl: undefined,
          notes: undefined,
        };

        logger.info("Auto-reconciling difference", { difference, transaction });
        reconcileTransaction(transaction, {
          onSuccess: () => {
            globalToast.showSuccess(
              "Balance reconciled automatically",
              "Reconciliation Complete",
              3000
            );
          },
          onError: (error) => {
            logger.error("Auto-reconcile failed", { error, difference });
            globalToast.showError("Failed to reconcile balance", "Error", 8000);
          },
        });
      } catch (error) {
        logger.error("Auto-reconcile failed", { error, difference });
        globalToast.showError("Failed to reconcile balance", "Error", 8000);
      }
    },
    [reconcileTransaction]
  );

  const getEnvelopeOptions = useCallback(() => {
    const options: EnvelopeOption[] = [
      { id: "unassigned", name: "Unassigned Cash" },
      ...envelopes.map((env: Envelope) => ({ id: env.id, name: env.name })),
      ...savingsGoals.map((goal: SavingsGoal) => ({
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
  paycheckHistory: PaycheckHistoryItem[] = [],
  setActiveView: (view: string) => void
) => {
  const normalizedHistory = useMemo<PaycheckEntry[]>(
    () =>
      paycheckHistory.map((entry) => ({
        ...entry,
        date: entry.date ?? entry.processedAt,
        processedAt: entry.processedAt ?? entry.date,
      })),
    [paycheckHistory]
  );

  const paydayPrediction = useMemo(() => {
    return normalizedHistory.length >= 2 ? predictNextPayday(normalizedHistory) : null;
  }, [normalizedHistory]);

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
    (transactions: DbTransaction[] = [], limit: number = 10) => {
      return (transactions || []).slice(0, limit);
    },
    []
  );

  const formatCurrency = useCallback((amount: number) => {
    return `$${Math.abs(amount || 0).toFixed(2)}`;
  }, []);

  const getTransactionIcon = useCallback((amount: number) => {
    return amount > 0 ? "TrendingUp" : "TrendingDown";
  }, []);

  const getTransactionColor = useCallback((amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  }, []);

  const getBalanceStatusColor = useCallback((isBalanced: boolean, difference: number) => {
    if (isBalanced) return "bg-green-50";
    return Math.abs(difference) > 10 ? "bg-red-50" : "bg-yellow-50";
  }, []);

  const getBalanceStatusIcon = useCallback((isBalanced: boolean, difference: number) => {
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
