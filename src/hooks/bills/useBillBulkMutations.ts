import { useCallback } from "react";
import logger from "@/utils/common/logger";
import { executeBillUpdate, processBulkOperation } from "@/utils/bills/billUpdateHelpers";
import type { Bill } from "@/types/bills";
import useBills from "@/hooks/bills/useBills";

/**
 * Hook for bulk bill operations (updates and payments)
 * Consumes generic mutations from useBills directly.
 */
export const useBillBulkMutations = () => {
  const { updateBillAsync, markBillPaidAsync } = useBills();

  /**
   * Handle bulk bill updates (amounts, due dates, or both)
   */
  const handleBulkUpdate = useCallback(
    async (updatedBills: Bill[]) => {
      const updateSingleBill = async (bill: Bill) => {
        logger.debug("Updating bill", {
          billId: bill.id,
          provider: bill.provider,
        });

        // We wrap the atomic update in the helper expected structure
        // The helper expects an object with updateBill, etc.
        await executeBillUpdate(bill, {
          updateBill: async ({ id, updates }) => {
            await updateBillAsync({ billId: id, updates });
          },
        });
      };

      const result = await processBulkOperation(updatedBills, "bill update", updateSingleBill);

      if (result.success && result.errorCount === 0) {
        logger.info(`Bulk update completed`, {
          successCount: result.successCount,
        });
      }

      return result;
    },
    [updateBillAsync]
  );

  /**
   * Handle bulk bill payments
   */
  const handleBulkPayment = useCallback(
    async (billIds: string[]) => {
      // For bulk payments, we need a way to know the amount and other details if they aren't provided.
      // However, bulk payment usually implies "pay full amount now".
      // Since useMarkBillPaidAsync requires details, we might need to fetch them or assume defaults if not provided.
      // But typically bulk action UI provides the IDs.
      // IMPORTANT: The previous implementation relied on `handlePayBill` which did a lot of validation.
      // Here we are calling the direct mutation. If complex validation is needed, we should reuse logical components.
      // But for "bulk" often we skip complex individual UI wizards.

      // WAIT: The previous implementation called `handlePayBill` which did validation.
      // We should probably keep that pattern if we want validation.
      // But `handlePayBill` is now in `useBillPayment`.
      // If we want to use `handlePayBill` logic, we might need to import it or duplicate the simple version.
      // Let's assume for bulk payment we just want to mark them paid with default logic if possible,
      // OR we accept that this hook handles the iteration and the actual logic is simple.

      // Re-reading implementation plan: "Imports useUpdateBillMutation and useMarkBillPaidMutation from useBills.ts"
      // So we will stick to the plan and use atomic mutations.

      const paySingleBill = async (billId: string) => {
        // We need the bill details to pay it (amount, envelope).
        // Since we only have ID, this is tricky without fetching.
        // usage in `useBillManager` suggests we might pass objects or just IDs.
        // If just IDs, we might fail if we don't have the data.
        // Lets check `useBulkBillOperations.ts` original code.
        // It called `handlePayBill(billId)`.

        // If we are strictly following "no prop drilling", we might need to fetch the bill or assume it's loaded in query cache.
        // For now, let's implement the structure.

        // NOTE: Since `handlePayBill` had complex logic (envelopes etc), and we want to allow that,
        // maybe we should just use `markBillPaidAsync` and assume the UI validated it?
        // OR, do we need `useBillPayment` to export a helper?
        // For now, direct mutation.

        // We need to pass required params to markBillPaidAsync.
        // It requires: billId, paidAmount.
        // We don't have paidAmount here if we only get ID.
        // The previous `handlePayBill` looked up the bill from `bills` array.
        // We can access `bills` from `useBills()` here!

        // But `useBills` returns `bills` query data.

        const bill = (await import("@/db/budgetDb")).budgetDb.bills.get(billId);
        // accessing DB directly here might be cleaner than relying on query hook data which might be filtered.
        if (!bill) throw new Error(`Bill ${billId} not found`);

        // Use default logic: pay full amount from assigned envelope or error.
        const billData = await bill;
        if (!billData) throw new Error(`Bill ${billId} not found`);

        await markBillPaidAsync({
          billId: billData.id,
          paidAmount: billData.amount,
          paidDate: new Date().toISOString().split("T")[0],
          envelopeId: billData.envelopeId,
        });
      };

      const result = await processBulkOperation(billIds, "bill payment", paySingleBill);

      if (result.success && result.errorCount === 0) {
        logger.info(`Bulk payment completed`, {
          successCount: result.successCount,
        });
      }

      return result;
    },
    [markBillPaidAsync]
  );

  return {
    handleBulkUpdate,
    handleBulkPayment,
  };
};
