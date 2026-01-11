import { useCallback } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";
import type { UseMutateFunction } from "@tanstack/react-query";
import type {
  Envelope,
  SavingsGoal,
  ReconcileInput,
  TransactionFormState,
  EnvelopeOption,
} from "./types";

/**
 * Hook for handling transaction reconciliation process
 * Extracts reconciliation logic and validation
 */
export const useReconciliation = (
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

      const transaction = createReconciliationTransaction(newTransaction);

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
          isScheduled: false,
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

// Helper function to create transaction object
const createReconciliationTransaction = (formState: TransactionFormState): ReconcileInput => {
  const amount = parseFloat(formState.amount || "0");
  const isExpense = (formState.type || "expense") === "expense";

  return {
    id: (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()) as string,
    date: formState.date ? new Date(formState.date) : new Date(),
    amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
    envelopeId: formState.envelopeId || "unassigned",
    category: formState.category || "other",
    type: formState.type || (isExpense ? "expense" : "income"),
    description: formState.description?.trim() || "Reconciled transaction",
    isScheduled: false,
    merchant: undefined,
    receiptUrl: undefined,
    notes: undefined,
  };
};
