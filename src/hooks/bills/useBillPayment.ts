import { useCallback } from "react";
import logger from "@/utils/common/logger";
import { executeBillUpdate } from "@/utils/bills/billUpdateHelpers";
import { globalToast } from "@/stores/ui/toastStore";

/**
 * Hook for individual bill payment operations
 * Extracted from useBillOperations.js to reduce complexity
 */
export const useBillPayment = ({ bills, envelopes, budget, updateBill, onUpdateBill }) => {
  /**
   * Validate envelope balance for bill payment
   */
  const validatePaymentFunds = useCallback(
    (bill) => {
      if (bill.envelopeId) {
        const envelope = envelopes.find((env) => env.id === bill.envelopeId);
        if (!envelope) {
          const message = "Assigned envelope not found";
          globalToast.showError(message, "Bill Payment Failed");
          throw new Error(message);
        }

        const availableBalance = Number(envelope.currentBalance || 0);
        const billAmount = Math.abs(Number(bill.amount || 0));

        if (availableBalance < billAmount) {
          const message = `Insufficient funds in envelope "${envelope.name}". Available: $${availableBalance.toFixed(2)}, Required: $${billAmount.toFixed(2)}`;
          globalToast.showError(message, "Payment Blocked");
          throw new Error(message);
        }

        return {
          paymentSource: "envelope" as const,
          envelope,
          availableBalance,
          billAmount,
        };
      } else {
        const unassignedCash = Number(budget?.unassignedCash || 0);
        const billAmount = Math.abs(Number(bill.amount || 0));

        if (unassignedCash < billAmount) {
          const message = `Insufficient unassigned cash. Available: $${unassignedCash.toFixed(2)}, Required: $${billAmount.toFixed(2)}`;
          globalToast.showError(message, "Payment Blocked");
          throw new Error(message);
        }

        return {
          paymentSource: "unassigned" as const,
          availableBalance: unassignedCash,
          billAmount,
        };
      }
    },
    [envelopes, budget]
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
        const paymentContext = validatePaymentFunds(bill);

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

        const formattedAmount = Math.abs(Number(bill.amount || 0)).toFixed(2);
        const toastTitle =
          paymentContext.paymentSource === "envelope"
            ? `Envelope • ${paymentContext.envelope?.name ?? "Assigned"}`
            : "Unassigned Cash";
        globalToast.showSuccess(`Paid ${bill.name} for $${formattedAmount}`, toastTitle);

        return { success: true, updatedBill };
      } catch (error) {
        logger.error("Error paying bill", error, { billId });
        if (error instanceof Error) {
          globalToast.showError(error.message, "Bill Payment Failed");
        } else {
          globalToast.showError("Unable to complete bill payment.", "Bill Payment Failed");
        }
        throw error;
      }
    },
    [bills, validatePaymentFunds, updateBill, onUpdateBill, budget]
  );

  return {
    handlePayBill,
    validatePaymentFunds,
  };
};
