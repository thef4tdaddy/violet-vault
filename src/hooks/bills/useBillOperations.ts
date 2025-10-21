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
}) => {
  // Use focused sub-hooks
  const { validateBillData, createModificationHistory } = useBillValidation(envelopes);
  const { handlePayBill } = useBillPayment({
    bills,
    envelopes,
    budget,
    updateBill,
    onUpdateBill,
  });
  const { handleBulkUpdate, handleBulkPayment } = useBulkBillOperations({
    updateBill,
    onUpdateBill,
    budget,
    handlePayBill,
  });

  // Use wrapper functions with error handling and processing state
  const { wrappedHandleBulkUpdate, wrappedHandlePayBill, wrappedHandleBulkPayment, isProcessing } =
    useBillOperationWrappers({
      handleBulkUpdate,
      handlePayBill,
      handleBulkPayment,
      onError,
    });

  return {
    // Operations
    handleBulkUpdate: wrappedHandleBulkUpdate,
    handlePayBill: wrappedHandlePayBill,
    handleBulkPayment: wrappedHandleBulkPayment,

    // Validation
    validateBillData,
    createModificationHistory,

    // State
    isProcessing,
  };
};

export default useBillOperations;
