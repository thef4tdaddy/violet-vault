/**
 * Transaction operations helpers for ledger
 * Extracted from useTransactionLedger to reduce complexity
 */
import logger from "../../../utils/common/logger";

export const useLedgerOperations = (
  addTransaction,
  deleteTransaction,
  updateBill,
  envelopes
) => {
  const handlePayBill = (billPayment) => {
    const billEnvelope = envelopes.find((env) => env.id === billPayment.billId);
    if (billEnvelope) {
      const updatedBill = {
        ...billEnvelope,
        lastPaidDate: billPayment.paidDate,
        lastPaidAmount: billPayment.amount,
        currentBalance: Math.max(0, (billEnvelope.currentBalance || 0) - billPayment.amount),
        isPaid: true,
        paidThisPeriod: true,
      };
      updateBill(updatedBill);
    }
  };

  const handleSplitTransaction = async (originalTransaction, splitTransactions) => {
    try {
      deleteTransaction(originalTransaction.id);
      for (const splitTransaction of splitTransactions) {
        addTransaction(splitTransaction);
      }
    } catch (error) {
      logger.error("Error splitting transaction:", error);
      throw error;
    }
  };

  return {
    handlePayBill,
    handleSplitTransaction,
  };
};
