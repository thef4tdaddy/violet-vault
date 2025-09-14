import { useCallback } from "react";
import logger from "../../utils/common/logger";
import {
  executeBillUpdate,
  processBulkOperation,
} from "../../utils/bills/billUpdateHelpers";

/**
 * Hook for bulk bill operations (updates and payments)
 * Extracted from useBillOperations.js to reduce complexity
 */
export const useBulkBillOperations = ({
  updateBill,
  onUpdateBill,
  budget,
  handlePayBill,
}) => {
  /**
   * Handle bulk bill updates (amounts, due dates, or both)
   */
  const handleBulkUpdate = useCallback(
    async (updatedBills) => {
      const updateSingleBill = async (bill) => {
        logger.debug("Updating bill", {
          billId: bill.id,
          provider: bill.provider,
        });

        await executeBillUpdate(bill, { updateBill, onUpdateBill, budget });
      };

      const result = await processBulkOperation(
        updatedBills,
        "bill update",
        updateSingleBill,
      );

      if (result.success && result.errorCount === 0) {
        logger.info(`Bulk update completed`, {
          successCount: result.successCount,
        });
      }

      return result;
    },
    [updateBill, onUpdateBill, budget],
  );

  /**
   * Handle bulk bill payments
   */
  const handleBulkPayment = useCallback(
    async (billIds) => {
      const paySingleBill = async (billId) => {
        const result = await handlePayBill(billId);
        if (!result.success) {
          throw new Error(result.error);
        }
      };

      const result = await processBulkOperation(
        billIds,
        "bill payment",
        paySingleBill,
      );

      if (result.success && result.errorCount === 0) {
        logger.info(`Bulk payment completed`, {
          successCount: result.successCount,
        });
      }

      return result;
    },
    [handlePayBill],
  );

  return {
    handleBulkUpdate,
    handleBulkPayment,
  };
};
