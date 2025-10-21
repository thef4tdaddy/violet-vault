import { useState, useCallback } from "react";

/**
 * Hook for wrapping bill operations with error handling and processing state
 * Extracted from useBillOperations.js to reduce function size
 */
export const useBillOperationWrappers = ({
  handleBulkUpdate,
  handlePayBill,
  handleBulkPayment,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const wrappedHandleBulkUpdate = useCallback(
    async (updatedBills) => {
      setIsProcessing(true);
      try {
        const result = await handleBulkUpdate(updatedBills);
        if (result.errorCount > 0) {
          onError?.(result.message);
        }
        return result;
      } catch (error) {
        const errorMessage = error.message || "Failed to update bills";
        onError?.(errorMessage);
        return {
          success: false,
          successCount: 0,
          errorCount: updatedBills.length,
          errors: [errorMessage],
          message: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [handleBulkUpdate, onError]
  );

  const wrappedHandlePayBill = useCallback(
    async (billId) => {
      setIsProcessing(true);
      try {
        const result = await handlePayBill(billId);
        return result;
      } catch (error) {
        const errorMessage = error.message || "Failed to pay bill";
        onError?.(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [handlePayBill, onError]
  );

  const wrappedHandleBulkPayment = useCallback(
    async (billIds) => {
      setIsProcessing(true);
      try {
        const result = await handleBulkPayment(billIds);
        if (result.errorCount > 0) {
          onError?.(result.message);
        }
        return result;
      } catch (error) {
        const errorMessage = error.message || "Failed to pay selected bills";
        onError?.(errorMessage);
        return {
          success: false,
          successCount: 0,
          errorCount: billIds.length,
          errors: [errorMessage],
          message: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [handleBulkPayment, onError]
  );

  return {
    wrappedHandleBulkUpdate,
    wrappedHandlePayBill,
    wrappedHandleBulkPayment,
    isProcessing,
  };
};
