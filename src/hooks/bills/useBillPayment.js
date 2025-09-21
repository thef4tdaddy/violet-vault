import { useCallback } from "react";
import logger from "../../utils/common/logger";
import { executeBillUpdate } from "../../utils/bills/billUpdateHelpers";

/**
 * Hook for individual bill payment operations
 * Extracted from useBillOperations.js to reduce complexity
 */
export const useBillPayment = ({
  bills,
  envelopes,
  budget,
  updateBill,
  onUpdateBill,
}) => {
  /**
   * Validate envelope balance for bill payment
   */
  const validatePaymentFunds = useCallback(
    (bill) => {
      if (bill.envelopeId) {
        const envelope = envelopes.find((env) => env.id === bill.envelopeId);
        if (!envelope) {
          throw new Error("Assigned envelope not found");
        }

        const availableBalance = envelope.currentBalance || 0;
        const billAmount = Math.abs(bill.amount);

        if (availableBalance < billAmount) {
          throw new Error(
            `Insufficient funds in envelope "${envelope.name}". Available: $${availableBalance.toFixed(2)}, Required: $${billAmount.toFixed(2)}`,
          );
        }
      } else {
        const unassignedCash = budget?.unassignedCash || 0;
        const billAmount = Math.abs(bill.amount);

        if (unassignedCash < billAmount) {
          throw new Error(
            `Insufficient unassigned cash. Available: $${unassignedCash.toFixed(2)}, Required: $${billAmount.toFixed(2)}`,
          );
        }
      }
    },
    [envelopes, budget],
  );

  /**
   * Handle individual bill payment with envelope balance checking
   */
  const handlePayBill = useCallback(
    async (billId) => {
      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) {
          throw new Error("Bill not found");
        }

        if (bill.isPaid) {
          throw new Error("Bill is already paid");
        }

        // Validate payment funds
        validatePaymentFunds(bill);

        const updatedBill = {
          ...bill,
          isPaid: true,
          paidDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString(),
          modificationHistory: [
            ...(bill.modificationHistory || []),
            {
              timestamp: new Date().toISOString(),
              type: "payment",
              changes: {
                isPaid: { from: false, to: true },
                paidDate: {
                  from: null,
                  to: new Date().toISOString().split("T")[0],
                },
              },
            },
          ],
        };

        // Update the bill
        await executeBillUpdate(updatedBill, {
          updateBill,
          onUpdateBill,
          budget,
        });

        logger.info("Bill payment completed", {
          billId: bill.id,
          amount: bill.amount,
          envelopeId: bill.envelopeId,
        });

        return { success: true, updatedBill };
      } catch (error) {
        logger.error("Error paying bill", error, { billId });
        throw error;
      }
    },
    [bills, validatePaymentFunds, updateBill, onUpdateBill, budget],
  );

  return {
    handlePayBill,
    validatePaymentFunds,
  };
};
