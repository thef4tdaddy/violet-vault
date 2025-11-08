import { useCallback } from "react";
import logger from "@/utils/common/logger";
import { executeBillUpdate } from "@/utils/bills/billUpdateHelpers";
import { globalToast } from "@/stores/ui/toastStore";

/**
 * Hook for individual bill payment operations
 * Extracted from useBillOperations.js to reduce complexity
 */
interface BillRecord {
  id: string;
  name?: string;
  amount?: number;
  envelopeId?: string;
  isPaid?: boolean;
  paidDate?: string | null;
  modificationHistory?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

interface EnvelopeRecord {
  id: string;
  name?: string;
  currentBalance?: number;
  [key: string]: unknown;
}

interface BudgetRecord {
  unassignedCash?: number;
  updateBill?: (bill: Record<string, unknown>) => void;
  [key: string]: unknown;
}

interface UseBillPaymentParams {
  bills: Array<Record<string, unknown>>;
  envelopes: Array<Record<string, unknown>>;
  budget?: BudgetRecord;
  updateBill: (options: { id: string; updates: Record<string, unknown> }) => Promise<void>;
  onUpdateBill?: (bill: Record<string, unknown>) => void | Promise<void>;
  markBillPaid?: (params: {
    billId: string;
    paidAmount: number;
    paidDate?: string;
    envelopeId?: string;
  }) => Promise<unknown>;
}

export const useBillPayment = ({
  bills,
  envelopes,
  budget,
  updateBill,
  onUpdateBill,
  markBillPaid,
}: UseBillPaymentParams) => {
  /**
   * Validate envelope balance for bill payment
   */
  const validatePaymentFunds = useCallback(
    (bill: BillRecord) => {
      if (bill.envelopeId) {
        const envelope = envelopes.find((env) => (env as EnvelopeRecord).id === bill.envelopeId) as
          | EnvelopeRecord
          | undefined;
        if (!envelope) {
          const message = "Assigned envelope not found";
          globalToast.showError(message, "Bill Payment Failed");
          throw new Error(message);
        }

        const availableBalance = Number(
          ((envelope as EnvelopeRecord).currentBalance ?? 0) as number
        );
        const billAmount = Math.abs(Number(bill.amount ?? 0));

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
        const unassignedCash = Number(budget?.unassignedCash ?? 0);
        const billAmount = Math.abs(Number(bill.amount ?? 0));

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
    async (billId: string) => {
      try {
        const bill = bills.find((b) => (b as BillRecord).id === billId) as BillRecord | undefined;
        if (!bill) {
          throw new Error("Bill not found");
        }

        if (bill.isPaid) {
          throw new Error("Bill is already paid");
        }

        // Validate payment funds
        const paymentContext = validatePaymentFunds(bill);

        const paymentDate = new Date().toISOString().split("T")[0];

        const updatedBill: BillRecord = {
          ...bill,
          isPaid: true,
          paidDate: paymentDate,
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
                  to: paymentDate,
                },
              },
            },
          ],
        };

        if (markBillPaid) {
          await markBillPaid({
            billId: bill.id,
            paidAmount: paymentContext.billAmount,
            paidDate: paymentDate,
            envelopeId: bill.envelopeId,
          });
        }

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

        const formattedAmount = Math.abs(Number(bill.amount ?? 0)).toFixed(2);
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
    [bills, validatePaymentFunds, updateBill, onUpdateBill, budget, markBillPaid]
  );

  return {
    handlePayBill,
    validatePaymentFunds,
  };
};
