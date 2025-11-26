import { useCallback } from "react";
import { useBillValidation } from "@/hooks/bills/useBillValidation";
import { useBillPayment } from "@/hooks/bills/useBillPayment";
import { useBulkBillOperations } from "@/hooks/bills/useBulkBillOperations";
import { useBillOperationWrappers } from "@/hooks/bills/useBillOperationWrappers";
import type { Bill, Envelope } from "@/types/bills";

interface BudgetContext extends Record<string, unknown> {
  unassignedCash?: number;
  updateBill?: (bill: Bill) => void | Promise<void>;
}

interface UseBillOperationsParams {
  bills?: Bill[];
  envelopes?: Envelope[];
  updateBill: (payload: { id: string; updates: Record<string, unknown> }) => Promise<void>;
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  onError?: (error: string) => void;
  budget?: BudgetContext;
  markBillPaid?: (params: {
    billId: string;
    paidAmount: number;
    paidDate?: string;
    envelopeId?: string;
  }) => Promise<unknown>;
}

/**
 * Custom hook for bill management operations
 * Refactored to use focused sub-hooks for better maintainability
 */
export const useBillOperations = ({
  bills = [],
  envelopes = [],
  updateBill,
  onUpdateBill,
  onError,
  budget,
  markBillPaid,
}: UseBillOperationsParams) => {
  // Use focused sub-hooks
  const { validateBillData, createModificationHistory } = useBillValidation(envelopes);
  const { handlePayBill } = useBillPayment({
    bills,
    envelopes,
    budget,
    updateBill,
    onUpdateBill,
    markBillPaid,
  });
  type PayBillOverrides = Parameters<typeof handlePayBill>[1];
  const payBillCore = useCallback(
    async (billId: string, overrides?: PayBillOverrides) => {
      await handlePayBill(billId, overrides);
    },
    [handlePayBill]
  );
  const { handleBulkUpdate: handleBulkUpdateTyped, handleBulkPayment } = useBulkBillOperations({
    updateBill,
    onUpdateBill,
    budget,
    handlePayBill: payBillCore,
  });
  // Wrap handleBulkUpdate to accept unknown[] as expected by useBillOperationWrappers
  const handleBulkUpdate = async (updatedBills: unknown[]) => {
    return handleBulkUpdateTyped(updatedBills as Bill[]);
  };

  // Use wrapper functions with error handling and processing state
  const { wrappedHandleBulkUpdate, wrappedHandlePayBill, wrappedHandleBulkPayment, isProcessing } =
    useBillOperationWrappers({
      handleBulkUpdate,
      handlePayBill: payBillCore,
      handleBulkPayment,
      onError,
    });

  const executePayBill = useCallback(
    async (
      billId: string,
      overrides?: { amount?: number; paidDate?: string; envelopeId?: string }
    ): Promise<void> => {
      await wrappedHandlePayBill(billId, overrides);
    },
    [wrappedHandlePayBill]
  );

  return {
    // Operations
    handleBulkUpdate: wrappedHandleBulkUpdate,
    handlePayBill: executePayBill,
    handleBulkPayment: wrappedHandleBulkPayment,

    // Validation
    validateBillData,
    createModificationHistory,

    // State
    isProcessing,
  };
};

export default useBillOperations;
