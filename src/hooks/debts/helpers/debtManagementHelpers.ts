/**
 * Helper functions for debt management operations
 * Extracted to reduce complexity in useDebtManagement
 */
import logger from "../../../utils/common/logger.ts";
import { convertPaymentFrequency } from "../../../utils/debts/debtCalculations";
import { DEBT_STATUS } from "../../../constants/debts";

/**
 * Create envelope and bill for new debt
 */
export const createEnvelopeAndBillForDebt = async (
  cleanDebtData,
  createdDebt,
  newEnvelopeName: string,
  createEnvelope,
  createBill
) => {
  const envelopeName = newEnvelopeName || `${cleanDebtData.name} Payment`;

  const newEnvelope = await createEnvelope({
    name: envelopeName,
    targetAmount: cleanDebtData.minimumPayment * 2,
    currentBalance: 0,
    category: "Fixed Expenses",
  });

  await createBill({
    name: `${cleanDebtData.name} Payment`,
    amount: cleanDebtData.minimumPayment,
    dueDate: cleanDebtData.paymentDueDate,
    frequency: convertPaymentFrequency(cleanDebtData.paymentFrequency),
    envelopeId: newEnvelope.id,
    debtId: createdDebt.id,
    isActive: true,
  });

  logger.info("Created new envelope and bill for debt");
};

/**
 * Handle bill connections for debt
 */
export const handleBillConnectionsForDebt = async (options: {
  connectionData: unknown;
  cleanDebtData: unknown;
  createdDebt: unknown;
  createEnvelope: (data: unknown) => Promise<unknown>;
  createBill: (data: unknown) => Promise<unknown>;
  updateBill: (id: string, data: unknown) => Promise<unknown>;
}) => {
  const {
    connectionData,
    cleanDebtData,
    createdDebt,
    createEnvelope,
    createBill,
    updateBill,
  } = options;

  if (!connectionData) return;

  const {
    paymentMethod,
    createBill: shouldCreateBill,
    existingBillId,
    newEnvelopeName,
  } = connectionData as {
    paymentMethod?: string;
    createBill?: boolean;
    existingBillId?: string;
    newEnvelopeName?: string;
  };

  if (paymentMethod === "create_new" && shouldCreateBill) {
    await createEnvelopeAndBillForDebt(
      cleanDebtData,
      createdDebt,
      newEnvelopeName,
      createEnvelope,
      createBill
    );
  } else if (paymentMethod === "connect_existing_bill" && existingBillId) {
    await updateBill(existingBillId, { debtId: (createdDebt as { id: string }).id });
    logger.info("Connected debt to existing bill");
  }
};

/**
 * Build debt with payment history
 */
export const buildDebtWithPayment = (debt, amount, paymentDate, interestPortion, principalPortion) => {
  const newBalance = Math.max(0, debt.currentBalance - principalPortion);
  const updatedDebt = {
    ...debt,
    currentBalance: newBalance,
    lastPaymentDate: paymentDate,
    lastPaymentAmount: amount,
    status: newBalance === 0 ? DEBT_STATUS.PAID_OFF : debt.status,
  };

  if (!updatedDebt.paymentHistory) {
    updatedDebt.paymentHistory = [];
  }

  updatedDebt.paymentHistory.push({
    date: paymentDate,
    amount,
    interestPortion,
    principalPortion,
    balanceAfter: newBalance,
    notes: paymentDate.notes || "",
  });

  return updatedDebt;
};
