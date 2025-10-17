import { getBudgetMetadata, setBudgetMetadata, budgetDb } from "../../db/budgetDb.ts";
import logger from "../../utils/common/logger.ts";

export const useTransactionBalanceUpdater = () => {
  // Helper function to update balances when transactions are added/removed
  const updateBalancesForTransaction = async (transaction, isRemoving = false) => {
    const { envelopeId, amount, type } = transaction;
    const multiplier = isRemoving ? -1 : 1; // Reverse the effect when removing

    try {
      // Get current metadata
      const metadata = await getBudgetMetadata();
      const currentActualBalance = metadata?.actualBalance || 0;
      const currentUnassignedCash = metadata?.unassignedCash || 0;

      // Calculate actual balance change (income increases, expenses decrease)
      let actualBalanceChange = 0;
      if (type === "income") {
        actualBalanceChange = amount * multiplier;
      } else if (type === "expense") {
        actualBalanceChange = -Math.abs(amount) * multiplier;
      }

      // Update envelope balance or unassigned cash
      if (envelopeId === "unassigned" || !envelopeId) {
        // Update unassigned cash
        const unassignedChange =
          type === "income" ? amount * multiplier : -Math.abs(amount) * multiplier;

        await setBudgetMetadata({
          actualBalance: currentActualBalance + actualBalanceChange,
          unassignedCash: currentUnassignedCash + unassignedChange,
        });
      } else {
        // Update specific envelope balance
        const envelope = await budgetDb.envelopes.get(envelopeId);
        if (envelope) {
          const balanceChange =
            type === "income" ? amount * multiplier : -Math.abs(amount) * multiplier;

          const newBalance = (envelope.currentBalance || 0) + balanceChange;
          await budgetDb.envelopes.update(envelopeId, {
            currentBalance: newBalance,
            updatedAt: new Date().toISOString(),
          });
        }

        // Still update actual balance
        await setBudgetMetadata({
          actualBalance: currentActualBalance + actualBalanceChange,
        });
      }

      logger.debug("Balance updated for transaction", {
        transactionId: transaction.id,
        envelopeId,
        amount,
        type,
        actualBalanceChange,
        isRemoving,
      });
    } catch (error) {
      logger.error("Failed to update balances for transaction", error, {
        transactionId: transaction.id,
        envelopeId,
        amount,
        type,
      });
    }
  };

  return {
    updateBalancesForTransaction,
  };
};
