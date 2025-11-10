import { useCallback } from "react";
import { useBillValidation } from "./useBillValidation";
import { useBillPayment } from "./useBillPayment";
import { useBulkBillOperations } from "./useBulkBillOperations";
import { useBillOperationWrappers } from "./useBillOperationWrappers";

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
}: {
  bills?: Array<Record<string, unknown>>;
  envelopes?: Array<Record<string, unknown>>;
  updateBill: (payload: { id: string; updates: Record<string, unknown> }) => Promise<void>;
  onUpdateBill?: (bill: Record<string, unknown>) => void | Promise<void>;
  onError?: (error: string) => void;
  budget?: Record<string, unknown>;
  markBillPaid?: (params: {
    billId: string;
    paidAmount: number;
    paidDate?: string;
    envelopeId?: string;
  }) => Promise<unknown>;
}) => {
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
  const { handleBulkUpdate, handleBulkPayment } = useBulkBillOperations({
    updateBill,
    onUpdateBill,
    budget,
    handlePayBill: payBillCore,
  });

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
