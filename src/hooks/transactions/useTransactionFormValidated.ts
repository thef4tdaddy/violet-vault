/**
 * useTransactionFormValidated Hook
 * Standardized validation pattern for transaction forms using Zod schemas
 * Follows the pattern established in useBillFormValidated
 *
 * @example
 * ```tsx
 * // In a component:
 * const { validatedForm } = useTransactionLedger(currentUser);
 *
 * // Access form state and methods:
 * const { data, errors, isValid, isDirty, isSubmitting } = validatedForm.form;
 *
 * // Update a field:
 * validatedForm.form.updateField('amount', '100.00');
 *
 * // Submit the form:
 * await validatedForm.form.handleSubmit();
 *
 * // Delete transaction:
 * await validatedForm.handleDelete();
 * ```
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import { TransactionFormDataSchema, type TransactionFormData } from "@/domain/schemas/transaction";
import type { Transaction } from "@/types/finance";
import logger from "@/utils/common/logger";

interface UseTransactionFormValidatedOptions {
  editingTransaction?: Transaction | null;
  onAddTransaction?: (transaction: Transaction) => Promise<void> | void;
  onUpdateTransaction?: (transaction: Transaction) => Promise<void> | void;
  onDeleteTransaction?: (transactionId: string) => Promise<void> | void;
  onPayBill?: (billPayment: BillPayment) => void;
  onClose?: () => void;
  onError?: (error: string) => void;
  envelopes?: Array<{ id: string; name: string; envelopeType?: string }>;
}

interface BillPayment {
  billId: string;
  amount: number;
  paidDate: string;
  transactionId: string | number;
  notes: string;
}

/**
 * Helper: Convert form data to Transaction type
 */
function convertFormDataToTransaction(
  data: TransactionFormData,
  editingTransaction: Transaction | null | undefined
): Transaction {
  return {
    id: editingTransaction?.id || Date.now(),
    date: data.date,
    type: data.type,
    category: data.category,
    createdAt: editingTransaction?.createdAt || new Date().toISOString(),
    amount:
      data.type === "expense"
        ? -Math.abs(parseFloat(data.amount))
        : Math.abs(parseFloat(data.amount)),
    envelopeId: data.envelopeId,
    description: data.description,
    notes: data.notes,
    reconciled: data.reconciled,
  };
}

/**
 * Helper: Check if envelope is bill type and trigger payment
 */
function handleBillPaymentIfNeeded(
  data: TransactionFormData,
  transactionId: string | number,
  envelopes: Array<{ id: string; name: string; envelopeType?: string }>,
  onPayBill?: (billPayment: BillPayment) => void
): void {
  if (!data.envelopeId || !onPayBill) return;

  const selectedEnvelope = envelopes.find((env) => env.id === data.envelopeId);
  if (selectedEnvelope && selectedEnvelope.envelopeType === "bill") {
    const billPayment: BillPayment = {
      billId: selectedEnvelope.id,
      amount: Math.abs(parseFloat(data.amount)),
      paidDate: data.date,
      transactionId,
      notes: `Payment for ${selectedEnvelope.name} - ${data.description}`,
    };
    onPayBill(billPayment);
  }
}

/**
 * Helper: Create initial form data from transaction
 * Complexity justified: Necessary default value initialization for all form fields
 */
// eslint-disable-next-line complexity
function createInitialFormData(transaction: Transaction | null | undefined): TransactionFormData {
  return {
    date: transaction?.date || new Date().toISOString().split("T")[0],
    description: transaction?.description || "",
    amount: transaction?.amount ? Math.abs(transaction.amount).toString() : "",
    type: transaction?.type || "expense",
    envelopeId: transaction?.envelopeId ? String(transaction.envelopeId) : "",
    category: transaction?.category || "",
    notes: transaction?.notes || "",
    merchant: "",
    receiptUrl: "",
    reconciled: transaction?.reconciled || false,
  };
}

/**
 * Helper: Populate form with transaction data
 */
function populateFormWithTransaction(transaction: Transaction): Partial<TransactionFormData> {
  return {
    date: transaction.date || new Date().toISOString().split("T")[0],
    description: transaction.description || "",
    amount: Math.abs(transaction.amount).toString(),
    type: transaction.amount >= 0 ? "income" : "expense",
    envelopeId: transaction.envelopeId ? String(transaction.envelopeId) : "",
    category: transaction.category || "",
    notes: transaction.notes || "",
    reconciled: transaction.reconciled || false,
  };
}

/**
 * Transaction form hook using standardized validation pattern
 *
 * Key features:
 * 1. Uses useValidatedForm for state and validation
 * 2. Validation handled automatically by Zod schema
 * 3. Consistent error state management
 * 4. Automatic validation on submission
 */
export function useTransactionFormValidated({
  editingTransaction = null,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onPayBill,
  onClose,
  onError,
  envelopes = [],
}: UseTransactionFormValidatedOptions = {}) {
  const initialData = createInitialFormData(editingTransaction);

  // Use the validation hook
  const form = useValidatedForm({
    schema: TransactionFormDataSchema,
    initialData,
    validateOnChange: false,
    onSubmit: async (data) => {
      try {
        const transactionData = convertFormDataToTransaction(data, editingTransaction);

        handleBillPaymentIfNeeded(data, transactionData.id, envelopes, onPayBill);

        if (editingTransaction) {
          logger.debug("Updating transaction", { transactionId: transactionData.id });
          await onUpdateTransaction?.(transactionData);
        } else {
          logger.debug("Adding new transaction");
          await onAddTransaction?.(transactionData);
        }

        onClose?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save transaction";
        logger.error("Transaction submission error", { error });
        onError?.(errorMessage);
      }
    },
  });

  // Update form when editing transaction changes
  useEffect(() => {
    if (editingTransaction) {
      form.updateFormData(populateFormWithTransaction(editingTransaction));
    }
  }, [editingTransaction, form]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!editingTransaction?.id) return;

    try {
      logger.debug("Deleting transaction", { transactionId: editingTransaction.id });
      await onDeleteTransaction?.(String(editingTransaction.id));
      onClose?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete transaction";
      logger.error("Transaction deletion error", { error });
      onError?.(errorMessage);
    }
  }, [editingTransaction, onDeleteTransaction, onClose, onError]);

  return {
    form,
    handleDelete,
    isSubmitting: form.isSubmitting,
  };
}
