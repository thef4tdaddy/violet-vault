/**
 * Transaction operations helpers for ledger
 * Extracted from useTransactionLedger to reduce complexity
 */

interface BillPaymentPayload {
  billId: string | number;
  amount: number;
  paidDate: string;
  transactionId?: string | number;
  notes?: string;
}

type AddTransactionFn = (transaction: unknown) => unknown | Promise<unknown>;
type DeleteTransactionFn = (id: string | number) => unknown | Promise<unknown>;
type UpdateBillFn = ((bill: Record<string, unknown>) => void) | undefined;

type EnvelopeLike = Array<Record<string, unknown>>;

export const useLedgerOperations = (
  addTransaction: AddTransactionFn,
  deleteTransaction: DeleteTransactionFn,
  updateBill: UpdateBillFn,
  envelopes: EnvelopeLike
) => {
  const handlePayBill = (billPayment: BillPaymentPayload) => {
    const billEnvelope = envelopes.find((env) => env.id === billPayment.billId);
    if (billEnvelope && updateBill) {
      const currentBalance = Number(billEnvelope.currentBalance ?? 0);
      const updatedBill = {
        ...billEnvelope,
        lastPaidDate: billPayment.paidDate,
        lastPaidAmount: billPayment.amount,
        currentBalance: Math.max(0, currentBalance - billPayment.amount),
        isPaid: true,
        paidThisPeriod: true,
      };
      updateBill(updatedBill);
    }
  };

  const handleSplitTransaction = async (
    splitTransactions: unknown[],
    originalTransaction: unknown
  ): Promise<void> => {
    const original = originalTransaction as { id?: string | number };
    if (original?.id !== undefined) {
      await Promise.resolve(deleteTransaction(original.id));
    }

    for (const split of splitTransactions) {
      await Promise.resolve(addTransaction(split));
    }
  };

  return {
    handlePayBill,
    handleSplitTransaction,
  };
};
