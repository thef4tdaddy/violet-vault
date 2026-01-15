import { useCallback } from "react";
import logger from "@/utils/core/common/logger";
import { executeBillUpdate } from "@/utils/domain/bills/billUpdateHelpers";
import { globalToast } from "@/stores/ui/toastStore";
import type { Bill, Envelope } from "@/types/bills";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useBudgetMetadata } from "@/hooks/budgeting/metadata/useBudgetMetadata";

/**
 * Hook for individual bill payment operations
 * Refactored to be self-contained without prop drilling
 */
type ModificationHistoryEntry = {
  timestamp?: string;
  type?: string;
  changes?: Record<string, unknown>;
};

type BillRecord = Bill & {
  paidAmount?: number;
  modificationHistory?: ModificationHistoryEntry[];
  lastModified?: string;
};

type EnvelopeRecord = Envelope & {
  currentBalance?: number;
};

interface PayBillOverrides {
  amount?: number;
  paidDate?: string;
  envelopeId?: string;
  skipValidation?: boolean;
}

type BillInput = string | number | BillRecord;

const normalizeBillIdentifier = (
  billInput: BillInput
): { normalizedBillId: string; providedBill?: BillRecord } => {
  if (typeof billInput === "string") {
    return { normalizedBillId: billInput };
  }

  if (typeof billInput === "number") {
    return { normalizedBillId: String(billInput) };
  }

  if (billInput && typeof billInput === "object") {
    const candidateId = billInput.id;
    if (typeof candidateId === "string" && candidateId.trim() !== "") {
      return { normalizedBillId: candidateId, providedBill: billInput };
    }
    if (typeof candidateId === "number") {
      return { normalizedBillId: String(candidateId), providedBill: billInput };
    }
  }

  return { normalizedBillId: "" };
};

const selectBillForPayment = (
  billCollection: BillRecord[],
  normalizedBillId: string,
  providedBill?: BillRecord
): BillRecord => {
  if (!normalizedBillId) {
    throw new Error("Bill identifier is required to complete payment");
  }

  const matchedBill = billCollection.find((candidate) => candidate.id === normalizedBillId);

  if (matchedBill) {
    return matchedBill;
  }

  if (providedBill) {
    return providedBill;
  }

  throw new Error("Bill not found");
};

const resolvePaymentDetails = (bill: BillRecord, overrides?: PayBillOverrides) => {
  const effectiveEnvelopeId = overrides?.envelopeId ?? bill.envelopeId;
  const normalizedAmount = overrides?.amount !== undefined ? overrides.amount : (bill.amount ?? 0);
  const paymentAmount = Math.abs(Number(normalizedAmount ?? 0));

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const validationBill: BillRecord = {
    ...bill,
    amount: paymentAmount,
    envelopeId: effectiveEnvelopeId,
  };

  const paymentDate = (() => {
    if (!overrides?.paidDate) {
      return new Date().toISOString().split("T")[0];
    }
    const parsed = new Date(overrides.paidDate);
    return Number.isNaN(parsed.getTime())
      ? new Date().toISOString().split("T")[0]
      : parsed.toISOString().split("T")[0];
  })();

  return {
    paymentAmount,
    effectiveEnvelopeId,
    validationBill,
    paymentDate,
  };
};

const buildUpdatedBillRecord = (
  bill: BillRecord,
  paymentAmount: number,
  paymentDate: string,
  effectiveEnvelopeId?: string,
  overrides?: PayBillOverrides
): BillRecord => {
  const timestamp = new Date().toISOString();
  return {
    ...bill,
    isPaid: true,
    paidDate: paymentDate,
    paidAmount: paymentAmount,
    envelopeId: effectiveEnvelopeId || "unassigned",
    // lastModified handled by update logic or schema validation
    // lastModified: Date.now(),
    modificationHistory: [
      ...((bill.modificationHistory ?? []) as ModificationHistoryEntry[]),
      {
        timestamp,
        type: "payment",
        changes: {
          isPaid: { from: false, to: true },
          paidDate: {
            from: null,
            to: paymentDate,
          },
          ...(overrides?.amount !== undefined && {
            amount: {
              from: bill.amount ?? 0,
              to: paymentAmount,
            },
          }),
        },
      },
    ],
  };
};

/**
 * Hook for bill payment operations
 */
export const useBillPayment = () => {
  const { bills: tanStackBills, updateBillAsync, markBillPaidAsync } = useBills();
  const { envelopes } = useEnvelopes();
  const { unassignedCash } = useBudgetMetadata();

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
        const availableCash = Number(unassignedCash ?? 0);
        const billAmount = Math.abs(Number(bill.amount ?? 0));

        if (availableCash < billAmount) {
          const message = `Insufficient unassigned cash. Available: $${availableCash.toFixed(2)}, Required: $${billAmount.toFixed(2)}`;
          globalToast.showError(message, "Payment Blocked");
          throw new Error(message);
        }

        return {
          paymentSource: "unassigned" as const,
          availableBalance: availableCash,
          billAmount,
        };
      }
    },
    [envelopes, unassignedCash]
  );

  /**
   * Handle individual bill payment with envelope balance checking
   */
  const handlePayBill = useCallback(
    async (billInput: BillInput, overrides?: PayBillOverrides): Promise<void> => {
      let normalizedBillId = "";
      try {
        const { normalizedBillId: derivedId, providedBill } = normalizeBillIdentifier(billInput);
        normalizedBillId = derivedId;

        // Cast tanStackBills to BillRecord[] for compatibility
        const bill = selectBillForPayment(
          tanStackBills as unknown as BillRecord[],
          normalizedBillId,
          providedBill
        );
        if (bill.isPaid) {
          throw new Error("Bill is already paid");
        }

        const { paymentAmount, effectiveEnvelopeId, validationBill, paymentDate } =
          resolvePaymentDetails(bill, overrides);

        const paymentContext = validatePaymentFunds(validationBill);
        const updatedBill = buildUpdatedBillRecord(
          bill,
          paymentAmount,
          paymentDate,
          effectiveEnvelopeId,
          overrides
        );

        await markBillPaidAsync({
          billId: normalizedBillId,
          paidAmount: paymentAmount,
          paidDate: paymentDate,
          envelopeId: effectiveEnvelopeId,
        });

        // We also need to update other fields if needed using executeBillUpdate logic
        // But markBillPaidAsync handles the 'paid' status.
        // If we have other updates (like modification history), we might need updateBillAsync.
        // The original code called executeBillUpdate AND markBillPaid.
        // markBillPaidAsync only updates specific fields.
        // Let's ensure we persist the history if important.

        await executeBillUpdate(updatedBill, {
          updateBill: async ({ id, updates }) => {
            await updateBillAsync({ billId: id, updates });
          },
        });

        logger.info("Bill payment completed", {
          billId: normalizedBillId,
          amount: paymentAmount,
          envelopeId: effectiveEnvelopeId,
        });

        const formattedAmount = paymentAmount.toFixed(2);
        const toastTitle =
          paymentContext.paymentSource === "envelope"
            ? `Envelope • ${paymentContext.envelope?.name ?? "Assigned"}`
            : "Unassigned Cash";
        globalToast.showSuccess(`Paid ${bill.name} for $${formattedAmount}`, toastTitle);

        return;
      } catch (error) {
        logger.error("Error paying bill", error, { billId: normalizedBillId || billInput });
        if (error instanceof Error) {
          globalToast.showError(error.message, "Bill Payment Failed");
        } else {
          globalToast.showError("Unable to complete bill payment.", "Bill Payment Failed");
        }
        throw error;
      }
    },
    [tanStackBills, validatePaymentFunds, updateBillAsync, markBillPaidAsync]
  );

  return {
    handlePayBill,
    validatePaymentFunds,
  };
};
