import { getBudgetMetadata, setBudgetMetadata, budgetDb } from "../../db/budgetDb.ts";
import logger from "../../utils/common/logger.ts";

// Calculate the actual balance change
const calculateActualBalanceChange = (type, amount, multiplier) => {
  if (type === "income") {
    return amount * multiplier;
  }
  if (type === "expense") {
    return -Math.abs(amount) * multiplier;
  }
  return 0;
};

// Calculate the change for envelope or unassigned
const calculateBalanceChange = (type, amount, multiplier) => {
  return type === "income" ? amount * multiplier : -Math.abs(amount) * multiplier;
};

// Update unassigned cash balance
const updateUnassignedBalance = async (
  currentActualBalance,
  currentUnassignedCash,
  actualBalanceChange,
  unassignedChange
) => {
  await setBudgetMetadata({
    actualBalance: currentActualBalance + actualBalanceChange,
    unassignedCash: currentUnassignedCash + unassignedChange,
  });
};

// Update specific envelope balance
const updateEnvelopeBalance = async (
  envelopeId,
  balanceChange,
  currentActualBalance,
  actualBalanceChange
) => {
  const envelope = await budgetDb.envelopes.get(envelopeId);
  if (envelope) {
    const newBalance = (envelope.currentBalance || 0) + balanceChange;
    await budgetDb.envelopes.update(envelopeId, {
      currentBalance: newBalance,
      lastModified: Date.now(),
    });
  }

  await setBudgetMetadata({
    actualBalance: currentActualBalance + actualBalanceChange,
  });
};

export const useTransactionBalanceUpdater = () => {
  // Helper function to update balances when transactions are added/removed
  const updateBalancesForTransaction = async (transaction, isRemoving = false) => {
    const { envelopeId, amount, type } = transaction;
    const multiplier = isRemoving ? -1 : 1;

    try {
      const metadata = await getBudgetMetadata();
      const currentActualBalance = metadata?.actualBalance || 0;
      const currentUnassignedCash = metadata?.unassignedCash || 0;

      const actualBalanceChange = calculateActualBalanceChange(type, amount, multiplier);

      if (envelopeId === "unassigned" || !envelopeId) {
        const unassignedChange = calculateBalanceChange(type, amount, multiplier);
        await updateUnassignedBalance(
          currentActualBalance,
          currentUnassignedCash,
          actualBalanceChange,
          unassignedChange
        );
      } else {
        const balanceChange = calculateBalanceChange(type, amount, multiplier);
        await updateEnvelopeBalance(
          envelopeId,
          balanceChange,
          currentActualBalance,
          actualBalanceChange
        );
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
