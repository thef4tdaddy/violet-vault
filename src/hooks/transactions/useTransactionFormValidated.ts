/**
 * useTransactionFormValidated Hook
 * Standardized validation pattern for transaction form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This implements a standardized pattern using useValidatedForm and
 * TransactionFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import { TransactionFormSchema, type TransactionFormData } from "@/domain/schemas/transaction";
import type { Transaction } from "@/types/transactions";
import logger from "@/utils/common/logger";

interface UseTransactionFormValidatedOptions {
  transaction?: Transaction | null;
  isOpen?: boolean;
  onSubmit?: (transactionId: string | null, data: TransactionFormData) => Promise<void>;
}

/**
 * Hook for validated transaction form management
 * Uses the standardized useValidatedForm pattern with TransactionFormSchema
 */
export function useTransactionFormValidated({
  transaction = null,
  isOpen = false,
  onSubmit,
}: UseTransactionFormValidatedOptions = {}) {
  const isEditMode = !!transaction;

  // Build initial form data
  const buildInitialData = useCallback((): TransactionFormData => {
    if (transaction) {
      // Edit mode - populate from existing transaction
      return {
        date:
          typeof transaction.date === "string"
            ? transaction.date
            : new Date(transaction.date).toISOString().split("T")[0],
        amount: transaction.amount?.toString() || "",
        envelopeId: transaction.envelopeId || "",
        category: transaction.category || "",
        type: transaction.type || "expense",
        description: transaction.description || "",
        merchant: transaction.merchant || "",
        receiptUrl: transaction.receiptUrl || "",
      };
    } else {
      // Add mode - empty form with defaults
      const today = new Date().toISOString().split("T")[0];
      return {
        date: today,
        amount: "",
        envelopeId: "",
        category: "",
        type: "expense",
        description: "",
        merchant: "",
        receiptUrl: "",
      };
    }
  }, [transaction]);

  // Initialize form with validation
  const form = useValidatedForm({
    schema: TransactionFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided to useTransactionFormValidated");
        return;
      }

      try {
        // Submit validated data
        await onSubmit(transaction?.id || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} transaction:`, error);
        throw error; // Re-throw to let useValidatedForm handle state
      }
    },
  });

  // Update form when transaction changes
  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
  }, [transaction, isOpen, buildInitialData, form]);

  return {
    // Form state from validation hook
    ...form,

    // Additional computed state
    isEditMode,

    // Helper to check if form can be submitted
    canSubmit: form.isValid && !form.isSubmitting,
  };
}

/**
 * Usage Example:
 *
 * ```tsx
 * const transactionForm = useTransactionFormValidated({
 *   transaction: editingTransaction,
 *   isOpen: isModalOpen,
 *   onSubmit: async (transactionId, data) => {
 *     if (transactionId) {
 *       await updateTransaction(transactionId, data);
 *     } else {
 *       await createTransaction(data);
 *     }
 *   },
 * });
 *
 * // Access form state
 * const { data, errors, isValid, updateField, handleSubmit } = transactionForm;
 *
 * // Update a field
 * updateField('amount', '50.00');
 *
 * // Submit form
 * await handleSubmit();
 * ```
 */
